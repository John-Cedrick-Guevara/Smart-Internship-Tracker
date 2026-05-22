import io
import json

from PIL import Image
import torch
from transformers import AutoModelForImageTextToText, AutoProcessor
import regex as re


class MultumodalPipeline:
    def __init__(self):
        print("Initializing MultumodalPipeline")

        self.model_id = "HuggingFaceTB/SmolVLM-256M-Instruct"

        self.processor = AutoProcessor.from_pretrained(
            self.model_id, trust_remote_code=True
        )

        self.model = AutoModelForImageTextToText.from_pretrained(
            self.model_id,
            dtype=torch.bfloat16 if torch.cuda.is_available() else torch.float32,
            device_map="auto",
            trust_remote_code=True,
        )

        print("SmolVLM Pipeline Core Initialized successfully!")

    @staticmethod
    def _extract_json_object(text: str) -> dict:
        """
        Extract the first valid JSON object from model output.
        """
        text = text.strip()

        if text.startswith("```"):
            text = re.sub(r"^```(?:json)?\s*", "", text)
            text = re.sub(r"\s*```$", "", text)

        try:
            return json.loads(text)
        except json.JSONDecodeError:
            pass

        start = text.find("{")
        while start != -1:
            depth = 0
            in_string = False
            escape = False

            for idx in range(start, len(text)):
                char = text[idx]

                if escape:
                    escape = False
                    continue

                if char == "\\":
                    escape = True
                    continue

                if char == '"':
                    in_string = not in_string
                    continue

                if in_string:
                    continue

                if char == "{":
                    depth += 1
                elif char == "}":
                    depth -= 1
                    if depth == 0:
                        candidate = text[start : idx + 1]
                        try:
                            return json.loads(candidate)
                        except json.JSONDecodeError:
                            # Try a loose parse for malformed JSON-like output
                            loose = MultumodalPipeline._parse_loose_kv(candidate)
                            if loose:
                                return loose
                            break

            start = text.find("{", start + 1)

        loose = MultumodalPipeline._parse_loose_kv(text)
        if loose:
            return loose

        raise ValueError("Model failed to output a valid JSON block.")

    @staticmethod
    def _parse_loose_kv(text: str) -> dict:
        """
        Parse key/value pairs from malformed JSON-like output.
        """
        payload: dict[str, str] = {}
        for raw_line in text.splitlines():
            line = raw_line.strip()
            if not line or line.startswith("#"):
                continue

            # Drop trailing concatenations like "+" and inline comments
            if "#" in line:
                line = line.split("#", 1)[0].strip()
            if "+" in line:
                line = line.split("+", 1)[0].strip()

            match = re.match(
                r"^[\"']?([A-Za-z_][A-Za-z0-9_]*)[\"']?\s*[:=]\s*(.+)$", line
            )
            if not match:
                continue

            key, value = match.group(1), match.group(2).strip().rstrip(",")
            value = value.strip().strip("\"'")
            if value.lower() in {"none", "null", "n/a", "na"}:
                value = "Unknown"

            payload[key] = value

        return payload

    @staticmethod
    def _normalize_output(payload: dict) -> dict:
        """
        Coerce the model output into the flat schema expected by the API.
        """
        key_map = {
            "companyName": "company_name",
            "companyEmail": "company_email",
            "companyLocation": "location",
            "positionTitle": "position",
            "jobTitle": "position",
            "isPaid": "is_paid",
        }

        if payload:
            for source_key, target_key in key_map.items():
                if source_key in payload and target_key not in payload:
                    payload[target_key] = payload[source_key]

        normalized = {
            "company_name": "Unknown",
            "company_email": "Unknown",
            "position": "Unknown",
            "location": "Unknown",
            "duration": "Unknown",
            "url": "Unknown",
            "is_paid": "Unknown",
            "internship_details": "Unknown",
            "interview_questions": [],
        }

        for key in normalized:
            if key not in payload:
                continue

            value = payload[key]
            if key == "interview_questions":
                if isinstance(value, list):
                    normalized[key] = [str(item) for item in value if item is not None]
                elif value is not None:
                    normalized[key] = [str(value)]
                continue

            if value is None:
                continue

            if isinstance(value, (dict, list)):
                normalized[key] = json.dumps(value, ensure_ascii=False)
            else:
                normalized[key] = str(value)

        return normalized

    def process_image(self, image_bytes: bytes) -> dict:
        try:
            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

            prompt = """"
                Extract internship details from the provided screenshot.

Return EXACTLY one valid JSON object with the following schema:

{
  "company_name": "string",
  "company_email": "string",
  "position": "string",
  "location": "string",
  "duration": "string",
  "url": "string",
  "is_paid": "string",
  "internship_details": "string",
  "interview_questions": ["string"]
}

Rules:
- Use ONLY the keys listed above. Do not add, remove, or rename keys.
- All fields MUST be strings, except "interview_questions" which MUST be an array of strings.
- Do NOT return numbers, booleans, nulls, nested objects, or additional arrays.
- If any value is missing, unclear, or not visible, return "Unknown" (as a string).
- Normalize extracted text (trim whitespace, remove line breaks unless necessary).
- For "interview_questions", extract only explicit questions; if none are present, return an empty array [].
- Ensure the output is valid JSON (parsable).

Output constraints:
- Output ONLY the JSON object.
- Do NOT include explanations, markdown, or any text before or after the JSON.
- The response MUST start with "{" and end with "}".
                """

            messages = [
                {
                    "role": "user",
                    "content": [
                        {"type": "image"},
                        {"type": "text", "text": prompt},
                    ],
                }
            ]

            text_prompt = self.processor.apply_chat_template(
                messages,
                add_generation_prompt=True,
            )

            inputs = self.processor(text=text_prompt, images=image, return_tensors="pt")
            inputs = {k: v.to(self.model.device) for k, v in inputs.items()}

            with torch.no_grad():
                generated_ids = self.model.generate(
                    **inputs,
                    max_new_tokens=250,
                    do_sample=True,
                    temperature=0.4,
                    repetition_penalty=1.2,
                )

            prompt_length = inputs["input_ids"].shape[-1]
            generated_only = generated_ids[:, prompt_length:]
            generated_text = self.processor.batch_decode(
                generated_only,
                skip_special_tokens=True,
            )[0].strip()

            print(f"Raw model output: {generated_text}")

            return self._normalize_output(self._extract_json_object(generated_text))

        except Exception as e:
            print(f"Error during image processing: {str(e)}")
            return {
                "company_name": "Parsing Error",
                "company_email": "Unknown",
                "position": "Unknown",
                "location": "Unknown",
                "duration": "Unknown",
                "url": "Unknown",
                "is_paid": "Unknown",
                "internship_details": "Unknown",
                "interview_questions": [],
            }
