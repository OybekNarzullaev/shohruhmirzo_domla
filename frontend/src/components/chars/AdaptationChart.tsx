import Plot from "react-plotly.js";

export const AdaptationChart = () => {
  // --- Foydalanuvchi qiymatlari ---
  const rawText = `
0,46
0,44
0,47
0,48
0,46
0,46
0,48
0,48
0,46
0,48
0,47
0,47
0,48
0,44
0,45
0,48
0,47
0,47
0,48
0,47
0,42
0,47
0,46
0,48
0,47
0,45
0,47
0,42
0,46
0,44
0,45
0,23
0,40
0,45
0,31
0,44
0,35
0,46
0,43
0,29
0,19
0,26
0,29
0,29
0,39
0,31
0,26
0,31
0,19
0,35
0,24
0,05
0,14
0,38
0,44
0,47
0,13
0,31
0,44
0,55
0,35
0,41
0,28
0,31
0,60
0,69
0,52
0,67
0,62
0,52
0,65
0,81
0,65
0,83
0,31
0,79
0,72
0,69
0,76
0,52
0,74
0,83
0,96
0,76
0,74
0,81
0,96
0,92
0,85
0,96
0,94
1,05
0,90
0,94
0,96
0,85
1,05
1,07
1,05
1,05
`.trim();

  // --- Ma’lumotlarni tayyorlash ---
  const values = rawText
    .split("\n")
    .map((x) => parseFloat(x.replace(",", ".")));
  const xValues = Array.from({ length: values.length }, (_, i) => i + 1);
  const yMax = Math.max(...values);

  // --- Nuqtalar rangi oraliqqa qarab ---
  const pointColors = values.map((v) =>
    v <= 0.59 ? "#2E7D32" : v <= 0.79 ? "#F9A825" : "#C2185B"
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
      name: "Yuqori moslashuv sohasi",
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
      name: "O'rtacha moslashuv sohasi",
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
      name: "Past moslashuv sohasi",
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
      text: "Yuklamaga moslashish grafigi(yuklamaga moslashgan sportchining natijasi)",
      font: { size: 14 },
    },
    xaxis: {
      title: {
        text: "Yuklamalar (Mashg'ulot Training session) ketma-ketligi",
        font: { size: 14 },
      },
      range: [1, values.length],
      gridcolor: "rgba(0,0,0,0.3)",
    },
    yaxis: {
      title: {
        text: "Yuklamaga moslashish koeffitsiyenti",
        font: { size: 14 },
      },
      range: [0, yMax],
      gridcolor: "rgba(0,0,0,0.3)",
    },
    font: {
      family: "Times New Roman",
      size: 14,
    },
    shapes: [
      // Fon oraliqlari
      {
        type: "rect",
        xref: "paper",
        x0: 0,
        x1: 1,
        y0: 0.0,
        y1: 0.59,
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
        y0: 0.6,
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
        y1: yMax,
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
      font: { size: 14 },
    },
    plot_bgcolor: "white",
    paper_bgcolor: "white",
    margin: { l: 60, r: 20, t: 70, b: 50 },
    autosize: true,
    width: 1300, // Approximate figsize (13,7) in pixels (assuming ~100 dpi)
    height: 700,
  };

  return (
    <Plot
      data={traces}
      layout={layout}
      style={{ width: "100%", height: "700px" }}
    />
  );
};
