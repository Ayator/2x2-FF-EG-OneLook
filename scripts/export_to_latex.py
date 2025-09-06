import json
import algorithm_manager  # Your module for algorithm formatting/inversion

def generate_latex_table(json_path, png_dir, output_tex, title="2x2 First Face Algorithms w/ Onelook"):
    with open(json_path) as f:
        data = json.load(f)

    rows = []
    # Main title: Huge, bold, extra vertical space
    rows.append(r'\hline')
    rows.append(
        r'\multicolumn{4}{|c|}{\rule{0pt}{2.2em}\huge\textbf{' + title + r'}}\\ \hline'
    )

    for block in data:
        set_name = block['setName']
        # Subtitle: Large bold, more vertical space
        rows.append(
            r'\multicolumn{4}{|c|}{\rule{0pt}{1.7em}\large\textbf{' + set_name + r'}}\\ \hline'
        )
        for subset in block['subsets']:
            case_cells = []
            for case in subset:
                alg = case['case']
                alg_formatted = algorithm_manager.format_algorithm_string(alg)
                setup = algorithm_manager.invert_algorithm(alg_formatted)
                i = [s for s in block['subsets']].index(subset)
                j = subset.index(case)
                filename = f"{block['setName']}[{i}][{j}]={alg}.png"
                cell = (
                    r"\begin{tabular}{c}"
                    f"{setup} \\\\ [2pt]\n"
                    f"\\includegraphics[width=0.95\\linewidth]{{{png_dir}/{filename}}} \\\\ [2pt]\n"
                    f"{alg_formatted}"
                    r"\end{tabular}"
                )
                case_cells.append(cell)
            while len(case_cells) < 4:
                case_cells.append("")
            rows.append(" & ".join(case_cells) + r" \\ \hline")

    latex_body = "\n".join(rows)

    with open(output_tex, "w") as out:
        out.write(r"""\documentclass{article}
\usepackage[margin=0.5in]{geometry}
\usepackage{longtable}
\usepackage{graphicx}
\usepackage{array}
                  
\usepackage{fancyhdr}
\pagestyle{fancy}
\fancyhf{}
\fancyfoot[C]{2x2 First Face Algorithms w/ Onelook - Ayator}

\begin{document}
\setlength{\tabcolsep}{3pt}
\setlength{\LTcapwidth}{\textwidth}
\begin{longtable}{|>{\centering\arraybackslash}p{0.24\textwidth}|>{\centering\arraybackslash}p{0.24\textwidth}|>{\centering\arraybackslash}p{0.24\textwidth}|>{\centering\arraybackslash}p{0.24\textwidth}|}
""")
        out.write(latex_body)
        out.write(r"""
\end{longtable}

\end{document}
""")

if __name__ == "__main__":
    generate_latex_table(
        "algs_numbers.json",
        "../first_face_algs_png",
        "../latex/2x2_First_Face_Onelook.tex"
    )
