const TwinMap = {
    map: null,
    markers: [],
    markerLayer: null,

    init() {
        this.map = L.map('map', {
            center: [20, 30],
            zoom: 2,
            minZoom: 2,
            maxZoom: 18,
            zoomControl: true
        });

        L.tileLayer(
            'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png',
            {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 19
            }
        ).addTo(this.map);

        this.markerLayer = L.layerGroup().addTo(this.map);
    },

    renderMarkers(cities) {
        this.markerLayer.clearLayers();
        this.markers = [];

        cities.forEach(city => {
            const color = TwinData.categoryColors[city.category];
            const marker = L.circleMarker([city.lat, city.lng], {
                radius: 9,
                fillColor: color,
                color: '#333333',
                weight: 2,
                opacity: 0.9,
                fillOpacity: 0.8
            });

            marker.bindPopup(this._buildPopupContent(city), {
                maxWidth: 320,
                minWidth: 260,
                className: 'twin-popup'
            });

            marker.on('mouseover', function () { this.setRadius(13); });
            marker.on('mouseout', function () { this.setRadius(9); });

            marker.addTo(this.markerLayer);
            this.markers.push({ marker, cityId: city.id });
        });
    },

    focusCity(city) {
        this.map.flyTo([city.lat, city.lng], 14, { duration: 1.5 });
        const found = this.markers.find(m => m.cityId === city.id);
        if (found) {
            setTimeout(() => found.marker.openPopup(), 1600);
        }
    },

    _buildPopupContent(city) {
        const catLabel = TwinData.categoryLabels[city.category];
        const catColor = TwinData.categoryColors[city.category];
        const tagsHtml = city.tags
            .map(t => '<span class="tag">' + t + '</span>')
            .join('');

        return '<div class="popup-card">' +
            '<h2 style="color:' + catColor + '">' + city.twinName + '</h2>' +
            '<p class="en-name">' + city.twinNameEn + '</p>' +
            '<hr>' +
            '<span class="category-badge" style="background:' + catColor + '">' + catLabel + '</span>' +
            '<p class="real-location">' +
                '<strong>真实地点:</strong> ' + city.realName + '<br>' +
                '<small>' + city.realLocation + '</small>' +
            '</p>' +
            '<hr>' +
            '<p class="description">' + city.description + '</p>' +
            '<hr>' +
            '<div class="tags">' + tagsHtml + '</div>' +
        '</div>';
    }
};
