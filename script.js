window.onload = () => {
  const map = L.map('map').setView([-1.5, 101.3], 11);

  // Basemap
  const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // Earth Engine Tile
  const eeTile = L.tileLayer("https://earthengine.googleapis.com/v1/projects/ee-mrgridhoarazzak/maps/c185eaed844ee168dc99d51c8ac536c6-257eccd23ab8be4d98d65efe29b4153f/tiles/{z}/{x}/{y}", {
    attribution: "Google Earth Engine",
    opacity: 0.7
  });

  // Warna Kelas
  const warnaKelas = {
    sawah: "#ADFF2F",
    bukansawah: "#FFD700",
    sungai: "#1E90FF",
    pemukiman: "#FF4500",
    hutan: "#006400"
  };

  let dataKelas = {};
  let layerGeojson;

  fetch("klasifikasi_polygon_sungai_pagu.json")
    .then(res => res.json())
    .then(geojson => {
      layerGeojson = L.geoJSON(geojson, {
        style: feature => {
          const k = feature.properties.Kelas || 'lainnya';
          return {
            color: warnaKelas[k] || '#888',
            fillColor: warnaKelas[k] || '#888',
            weight: 1,
            fillOpacity: 0.6
          };
        },
        onEachFeature: (feature, layer) => {
          const k = feature.properties.Kelas || 'tidak diketahui';
          const luas = feature.properties["Luas (ha)"] || 0;
          dataKelas[k] = (dataKelas[k] || 0) + luas;
          layer.bindPopup(`<b style="color:${warnaKelas[k] || '#000'}">${k}</b><br>Luas: ${luas.toFixed(2)} ha`);
        }
      }).addTo(map);
      map.fitBounds(layerGeojson.getBounds());
      tampilkanChart(dataKelas);
      tambahLegend();
    });

  function tampilkanChart(data) {
    const labels = Object.keys(data);
    const values = labels.map(k => data[k]);
    const colors = labels.map(k => warnaKelas[k] || '#888');

    const ctx = document.getElementById('chart').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Luas (ha)',
          data: values,
          backgroundColor: colors
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: 'Luas Tiap Kelas Lahan (ha)'
          }
        }
      }
    });
  }

  window.downloadCSV = () => {
    const rows = [['Kelas', 'Luas (ha)']];
    for (const [k, v] of Object.entries(dataKelas)) {
      rows.push([k, v.toFixed(2)]);
    }
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'klasifikasi.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  function tambahLegend() {
    const legend = L.control({ position: "bottomright" });
    legend.onAdd = function () {
      const div = L.DomUtil.create("div", "legend");
      div.innerHTML = "<strong>Legenda Kelas</strong><br>";
      for (const [kelas, warna] of Object.entries(warnaKelas)) {
        div.innerHTML += `<i style="background:${warna}"></i> ${kelas}<br>`;
      }
      return div;
    };
    legend.addTo(map);
  }

  // Layer Control
  L.control.layers(
    { "OpenStreetMap": osm },
    {
      "Earth Engine Tile": eeTile,
      "Klasifikasi Poligon": layerGeojson
    },
    { collapsed: false }
  ).addTo(map);
};
