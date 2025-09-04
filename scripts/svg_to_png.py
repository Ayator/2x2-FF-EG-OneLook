import os
import subprocess

def convert_svg_to_png(svg_folder, png_folder):
	os.makedirs(png_folder, exist_ok=True)
	for filename in os.listdir(svg_folder):
		if filename.endswith(".svg"):
			svg_path = os.path.join(svg_folder, filename)

			png_filename = filename.replace(".svg", ".png")
			png_path = os.path.join(png_folder, png_filename)

			subprocess.run(["inkscape", svg_path, "--export-type=png", "--export-filename", png_path])
			print(f"Converted {svg_path} to {png_path}")

convert_svg_to_png("../first_face_algs_svg", "../first_face_algs_png")