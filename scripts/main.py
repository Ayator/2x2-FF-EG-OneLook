import download_algs
import svg_to_png
import git_commit_and_push
import insert_to_sheet

def update_sets(setNames = None, row = None, col = None):
    svgFilenames = download_algs.downloadFilesFromJSON('algs_numbers.json', onlySets=setNames, row=row, col=col)
    
    pngFilenames = svg_to_png.convert_svg_to_png("../first_face_algs_svg", "../first_face_algs_png", filenames=svgFilenames)
    svg_to_png.convert_svg_to_png("../first_face_case_svg", "../first_face_case_png")
    
    git_commit_and_push.git_commit_and_push(["first_face_algs_svg", "first_face_algs_png", "first_face_case_svg", "first_face_case_png"], "Update algorithm images", "../")
    
    insert_to_sheet.insert_images_to_sheet(filenames=pngFilenames)

if __name__ == "__main__":
    # update_sets()  # Update all sets
    update_sets(["TCLL+"])
    # update_sets(["LS-123"], 1, 2)
