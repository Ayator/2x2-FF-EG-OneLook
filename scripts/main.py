import download_algs
import svg_to_png
import insert_to_sheet

def update_sets(setNames = None, row = None, col = None):
    filenames = download_algs.downloadFilesFromJSON('algs_numbers.json', onlySets=setNames, row=row, col=col)
    svg_to_png.convert_svg_to_png("../first_face_algs_svg", "../first_face_algs_png", filenames=filenames)
    insert_to_sheet.insert_images_to_sheet(filenames=filenames)

if __name__ == "__main__":
    update_sets()
