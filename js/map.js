const TwinMap = {
    map: null,
    markers: [],
    markerLayer: null,
    pickMode: false,
    pickMarker: null,

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

        // Map click for pick mode
        var self = this;
        this.map.on('click', function (e) {
            if (!self.pickMode) return;
            var lat = e.latlng.lat.toFixed(6);
            var lng = e.latlng.lng.toFixed(6);

            // Place/move pick marker
            if (self.pickMarker) {
                self.pickMarker.setLatLng(e.latlng);
            } else {
                self.pickMarker = L.marker(e.latlng, {
                    icon: L.divIcon({
                        className: 'pick-marker',
                        html: '<div class="pick-pin"></div>',
                        iconSize: [24, 24],
                        iconAnchor: [12, 24]
                    })
                }).addTo(self.map);
            }

            // Fill coordinates in form
            document.getElementById('add-lat').value = lat;
            document.getElementById('add-lng').value = lng;
            document.getElementById('pick-hint').textContent = lat + ', ' + lng;
        });
    },

    enterPickMode() {
        this.pickMode = true;
        this.map.getContainer().style.cursor = 'crosshair';
    },

    exitPickMode() {
        this.pickMode = false;
        this.map.getContainer().style.cursor = '';
        if (this.pickMarker) {
            this.map.removeLayer(this.pickMarker);
            this.pickMarker = null;
        }
    },

    renderMarkers(cities) {
        this.markerLayer.clearLayers();
        this.markers = [];

        var self = this;
        cities.forEach(function (city) {
            var color = TwinData.categoryColors[city.category] || '#999';
            var marker = L.circleMarker([city.lat, city.lng], {
                radius: 9,
                fillColor: color,
                color: '#333333',
                weight: 2,
                opacity: 0.9,
                fillOpacity: 0.8
            });

            marker.bindPopup(self._buildPopupContent(city), {
                maxWidth: 320,
                minWidth: 260,
                className: 'twin-popup'
            });

            marker.on('mouseover', function () { this.setRadius(13); });
            marker.on('mouseout', function () { this.setRadius(9); });

            marker.addTo(self.markerLayer);
            self.markers.push({ marker: marker, cityId: city.id });
        });
    },

    focusCity(city) {
        this.map.flyTo([city.lat, city.lng], 14, { duration: 1.5 });
        var found = this.markers.find(function (m) { return m.cityId === city.id; });
        if (found) {
            setTimeout(function () { found.marker.openPopup(); }, 1600);
        }
    },

    _buildPopupContent(city) {
        var catLabel = TwinData.categoryLabels[city.category] || city.category;
        var catColor = TwinData.categoryColors[city.category] || '#999';
        var tagsHtml = (city.tags || [])
            .map(function (t) { return '<span class="tag">' + t + '</span>'; })
            .join('');

        var imageHtml = '';
        if (city.image) {
            imageHtml = '<img class="popup-image" src="' + city.image + '" alt="">';
        }

        var realInfo = '';
        if (city.realName) {
            realInfo = '<p class="real-location">' +
                '<strong>真实地点:</strong> ' + city.realName +
                (city.realLocation ? '<br><small>' + city.realLocation + '</small>' : '') +
                '</p>';
        }

        return '<div class="popup-card">' +
            '<h2 style="color:' + catColor + '">' + city.twinName + '</h2>' +
            '<hr>' +
            '<span class="category-badge" style="background:' + catColor + '">' + catLabel + '</span>' +
            realInfo +
            (city.description ? '<hr><p class="description">' + city.description + '</p>' : '') +
            imageHtml +
            (tagsHtml ? '<hr><div class="tags">' + tagsHtml + '</div>' : '') +
        '</div>';
    }
};
