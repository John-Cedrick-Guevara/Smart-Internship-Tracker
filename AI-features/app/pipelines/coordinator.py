import io
import json
from PIL import Image
import torch
from transformers import AutoProcessor, AutoModelForImageTextToText
import regex as re


# this is where i should define the AI flow?
class MultumodalPipeline:
    def __init__(self):
        print("Initializing MultumodalPipeline")

        # define model
        self.model_id = "HuggingFaceTB/SmolVLM-256M-Instruct"

        self.processor = AutoProcessor.from_pretrained(
            self.model_id, trust_remote_code=True
        )
        self.model = AutoModelForImageTextToText.from_pretrained(
            self.model_id,
            torch_dtype=torch.bfloat16 if torch.cuda.is_available() else torch.float32,
            device_map="auto",
            trust_remote_code=True,
        )

        print("SmolVLM Pipeline Core Initialized successfully!")

    def process_image(self, image_bytes: bytes) -> dict:
        try:
            # Convert bytes to PIL Image
            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

            # 4. Craft a strict system prompt to force the model to output clean JSON matching your schema
            prompt = (
                "Analyze this internship screenshot and extract details. You must respond ONLY with a raw JSON object "
                "using exactly these keys: 'company_name', 'company_email', 'position', 'location', 'duration', 'url', 'is_paid'. "
                "If a field cannot be found, set its value to 'Unknown'."
            )

            # 5. Format the message history template required by SmolVLM
            messages = [
                {
                    "role": "user",
                    "content": [{"type": "image"}, {"type": "text", "text": prompt}],
                }
            ]

            text_prompt = self.processor.apply_chat_template(
                messages, add_generation_prompt=True
            )
            inputs = self.processor(text=text_prompt, images=image, return_tensors="pt")
            # Move inputs to the same hardware device as the model (CPU or GPU)
            inputs = {k: v.to(self.model.device) for k, v in inputs.items()}

            # 7. Execute inference (generate text tokens)
            with torch.no_grad():  # Disable gradient calculations to save memory and speed it up
                generated_ids = self.model.generate(  # type: ignore
                    **inputs,
                    max_new_tokens=250,
                    do_sample=True,  #  Enable creative sampling
                    temperature=0.4,  #  Lower temperature keeps it focused but realistic
                    repetition_penalty=1.2,  # Crucial! Penalizes the model for repeating strings
                )

            # 8. Decode the tokens back into a readable string
            generated_text = self.processor.batch_decode(
                generated_ids, skip_special_tokens=True
            )[0]
            # 💡 Print out what the model ACTUALLY said so you can debug it in your terminal
            print(f"🤖 Raw Model Output Text: {generated_text}")

            # 2. Use advanced Regex to find the JSON object string anywhere in the response
            match = re.search(r"\{.*\}", generated_text, re.DOTALL)
            # Clean up the output string (extract just the JSON block if the model added conversational filler)
            json_start = generated_text.find("{")
            json_end = generated_text.rfind("}") + 1
            if json_start != -1 and json_end != -1:
                clean_json_str = generated_text[json_start:json_end]
                # Parse the string into a python dictionary
                return json.loads(clean_json_str)

            raise ValueError("Model failed to output a valid JSON block.")
        except Exception as e:
            print(f"❌ Error during image processing: {str(e)}")
            # Fallback structure so your API doesn't totally crash if parsing fails
            return {
                "company_name": "Parsing Error",
                "company_email": "Unknown",
                "position": "Unknown",
                "location": "Unknown",
                "duration": "Unknown",
                "url": "Unknown",
                "is_paid": "Unknown",
            }
