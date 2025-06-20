window.onload = () => {
  // Inisialisasi Leaflet Map
  const map = L.map('map').setView([-1.5, 101.3], 11);

  // Basemap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map);

  // Layer Tile Earth Engine
  const eeTileUrl = "https://earthengine.googleapis.com/v1/projects/ee-mrgridhoarazzak/maps/c185eaed844ee168dc99d51c8ac536c6-257eccd23ab8be4d98d65efe29b4153f/tiles/{z}/{x}/{y}";
  L.tileLayer(eeTileUrl, {
    attribution: "Google Earth Engine",
    opacity: 0.7
  }).addTo(map);

  // Data GeoJSON Klasifikasi
  const geojsonData = {
    "type": "FeatureCollection",
    "features": [
      { "type": "Feature", "geometry": { "type": "MultiPoint", "coordinates": [] }, "properties": { "Kelas": "sawah", "Luas (ha)": 2072.623 } },
      { "type": "Feature", "geometry": { "type": "MultiPoint", "coordinates": [] }, "properties": { "Kelas": "bukansawah", "Luas (ha)": 6484.287 } },
      { "type": "Feature", "geometry": { "type": "MultiPoint", "coordinates": [] }, "properties": { "Kelas": "sungai", "Luas (ha)": 810.228 } },
      { "type": "Feature", "geometry": { "type": "MultiPoint", "coordinates": [] }, "properties": { "Kelas": "pemukiman", "Luas (ha)": 459.168 } },
      { "type": "Feature", "geometry": { "type": "MultiPoint", "coordinates": [] }, "properties": { "Kelas": "hutan", "Luas (ha)": 18545.908 } }
    ]
  };

  // Warna RGB sesuai klasifikasi
  const warnaKelas = {
    "sawah": "#ADFF2F",
    "bukansawah": "#FFD700",
    "sungai": "#1E90FF",
    "pemukiman": "#FF4500",
    "hutan": "#006400"
  };

  // Tampilkan popup dari data GeoJSON
  L.geoJSON(geojsonData, {
    onEachFeature: function (feature, layer) {
      const props = feature.properties;
      const warna = warnaKelas[props.Kelas] || "#666";
      layer.bindPopup(
        `<b style="color:${warna}">${props.Kelas}</b><br>Luas: ${props["Luas (ha)"].toFixed(2)} ha`
      );
    }
  }).addTo(map);

  // Tambahkan LEGEND
  const legend = L.control({ position: "bottomright" });
  legend.onAdd = function () {
    const div = L.DomUtil.create("div", "legend");
    div.innerHTML = "<b>Legenda Kelas</b><br>";
    for (const [kelas, warna] of Object.entries(warnaKelas)) {
      div.innerHTML += `<i style="background:${warna}"></i>${kelas}<br>`;
    }
    return div;
  };
  legend.addTo(map);

  // Siapkan data Chart
  const labels = geojsonData.features.map(f => f.properties.Kelas);
  const dataLuas = geojsonData.features.map(f => f.properties["Luas (ha)"]);
  const warnaBar = labels.map(label => warnaKelas[label] || "#999");

  // Tampilkan Chart
  const ctx = document.getElementById('chart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Luas (ha)',
        data: dataLuas,
        backgroundColor: warnaBar
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

  // Tombol download CSV
  window.downloadCSV = () => {
    const rows = [['Kelas', 'Luas (ha)']];
    for (let i = 0; i < labels.length; i++) {
      rows.push([labels[i], dataLuas[i]]);
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

};
