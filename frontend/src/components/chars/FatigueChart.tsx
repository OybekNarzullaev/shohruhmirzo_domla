import Plot from "react-plotly.js";

export const FatigueChart = () => {
  // --- Foydalanuvchi qiymatlari ---
  const rawText = `
0,22
0,2
0,25
0,3
0,22
0,22
0,32
0,29
0,23
0,29
0,25
0,25
0,3
0,2
0,21
0,28
0,26
0,34
0,28
0,26
0,41
0,34
0,36
0,29
0,34
0,38
0,33
0,41
0,37
0,39
0,38
0,51
0,43
0,38
0,48
0,39
0,46
0,36
0,4
0,49
0,52
0,5
0,49
0,49
0,44
0,48
0,5
0,59
0,56
0,46
0,57
0,54
0,53
0,61
0,63
0,64
0,55
0,59
0,63
0,67
0,6
0,62
0,58
0,59
0,69
0,73
0,66
0,72
0,7
0,66
0,71
0,78
0,71
0,79
0,59
0,77
0,74
0,73
0,76
0,66
0,75
0,79
0,85
0,76
0,75
0,78
0,85
0,83
0,8
0,85
0,84
0,89
0,82
0,84
0,85
0,8
0,89
0,9
0,89
0,89
`.trim();

  // --- Ma’lumotlarni tayyorlash ---
  const values = rawText
    .split("\n")
    .map((x) => parseFloat(x.replace(",", ".")));
  const xValues = Array.from({ length: values.length }, (_, i) => i + 1);

  // --- Nuqtalar rangi oraliqqa qarab ---
  const pointColors = values.map((v) =>
    v < 0.5 ? "#2E7D32" : v < 0.8 ? "#F9A825" : "#C2185B"
  );

  // --- Traces ---
  const traces = [
    // Dummy traces for legend
    {
      x: [1],
      y: [0],
      mode: "markers",
      marker: {
        opacity: 0,
        symbol: "square",
        size: 10,
        color: "#B7E1A1",
        line: { width: 0 },
      },
      name: "Dastlabki holat sohasi",
      showlegend: true,
    },
    {
      x: [1],
      y: [0],
      mode: "markers",
      marker: {
        opacity: 0,
        symbol: "square",
        size: 10,
        color: "#FFF59D",
        line: { width: 0 },
      },
      name: "Kompensatsiyalangan charchoq holat sohasi",
      showlegend: true,
    },
    {
      x: [1],
      y: [0],
      mode: "markers",
      marker: {
        opacity: 0,
        symbol: "square",
        size: 10,
        color: "#F8BBD0",
        line: { width: 0 },
      },
      name: "Dekompensatsiyalangan charchoq holat sohasi",
      showlegend: true,
    },
    // Main trace: line + markers
    {
      x: xValues,
      y: values,
      type: "scatter",
      mode: "lines+markers",
      line: { width: 1.5 },
      marker: {
        size: 7, // Adjusted for similar appearance
        color: pointColors,
        line: { width: 0 },
      },
      showlegend: false,
    },
  ];

  // --- Layout ---
  const layout = {
    title: {
      text: "Mushak charchoq qiymatlari<br>(Sportchining yuklama doirasida bajargan mashqlarining charchoq qiymatlari)",
      font: { size: 16 },
    },
    xaxis: {
      title: {
        text: "Yuklamadagi mashqlar ketma-ketligi",
        font: { size: 16 },
      },
      range: [1, values.length],
      gridcolor: "rgba(0,0,0,0.3)",
    },
    yaxis: {
      title: {
        text: "Mushakning charchoq qiymati",
        font: { size: 16 },
      },
      range: [0, 1],
      gridcolor: "rgba(0,0,0,0.3)",
    },
    font: {
      family: "Times New Roman",
      size: 12,
    },
    shapes: [
      // Fon oraliqlari
      {
        type: "rect",
        xref: "paper",
        x0: 0,
        x1: 1,
        y0: 0.0,
        y1: 0.49,
        fillcolor: "#B7E1A1",
        opacity: 1,
        line: { width: 0 },
        layer: "below",
      },
      {
        type: "rect",
        xref: "paper",
        x0: 0,
        x1: 1,
        y0: 0.5,
        y1: 0.79,
        fillcolor: "#FFF59D",
        opacity: 1,
        line: { width: 0 },
        layer: "below",
      },
      {
        type: "rect",
        xref: "paper",
        x0: 0,
        x1: 1,
        y0: 0.8,
        y1: 1.0,
        fillcolor: "#F8BBD0",
        opacity: 1,
        line: { width: 0 },
        layer: "below",
      },
    ],
    legend: {
      x: 0,
      y: 1,
      xanchor: "left",
      yanchor: "top",
      font: { size: 16 },
    },
    plot_bgcolor: "white",
    paper_bgcolor: "white",
    margin: { l: 60, r: 20, t: 70, b: 50 },
    autosize: true,
  };

  return (
    <Plot
      data={traces}
      layout={layout}
      style={{ width: "100%", height: "600px" }}
    />
  );
};

export default FatigueChart;
