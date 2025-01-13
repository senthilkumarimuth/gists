from fpdf import FPDF
import os

def images_to_pdf(image_folder, output_folder):
    # Get all image files in the specified folder
    images = [img for img in os.listdir(image_folder) if img.lower().endswith(('.png', '.jpg', '.jpeg'))]
    images.sort()  # Sort images if needed

    for index, image in enumerate(images):
        pdf = FPDF()
        pdf.set_auto_page_break(0)
        pdf.add_page()
        pdf.image(os.path.join(image_folder, image), x=0, y=0, w=210, h=297)  # A4 size in mm
        output_pdf_path = os.path.join(output_folder, f'output_{index + 1}.pdf')  # Create a unique output file for each image
        pdf.output(output_pdf_path, 'F')

# Example usage
output_path = input("Please enter the output folder path: ")
images_to_pdf(r"C:\Users\senthil.marimuthu\OneDrive - HTC Global Services, Inc\HTC\HR\2024_2025\images", r"C:\Users\senthil.marimuthu\OneDrive - HTC Global Services, Inc\HTC\HR\2024_2025\images")
