import os
import subprocess

def convert_svg_to_png(svg_folder, png_folder, filenames = None):
	os.makedirs(png_folder, exist_ok=True)
	if filenames is None:
		filenames = os.listdir(svg_folder)

	pngFilenames = []
	for filename in filenames:
		if not filename.endswith(".svg"):
			continue
		svg_path = os.path.join(svg_folder, filename)

		png_filename = filename.replace(".svg", ".png")
		png_path = os.path.join(png_folder, png_filename)

		subprocess.run(["inkscape", svg_path, "--export-type=png", "--export-filename", png_path])
		print(f"Converted {svg_path} to {png_path}")
		pngFilenames.append(png_filename)
	return pngFilenames

if __name__ == "__main__":
	convert_svg_to_png("../first_face_algs_svg", "../first_face_algs_png")