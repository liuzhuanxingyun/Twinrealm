const TwinData = {
    cities: [],
    categoryColors: {
        rpg: '#D4A017',
        scifi: '#00B8D4',
        fantasy: '#9C64E8',
        anime: '#E8457A'
    },
    categoryLabels: {
        rpg: 'RPG',
        scifi: '科幻',
        fantasy: '奇幻',
        anime: '动漫'
    },

    load() {
        return fetch('/api/cities')
            .then(function (res) { return res.json(); })
            .then(function (data) {
                TwinData.cities = data.cities || [];
                return TwinData.cities;
            });
    },

    filter(activeCategories, searchTerm) {
        return this.cities.filter(function (city) {
            var categoryMatch = activeCategories.includes(city.category);
            if (!searchTerm) return categoryMatch;
            var term = searchTerm.toLowerCase();
            var searchMatch =
                (city.realName || '').toLowerCase().includes(term) ||
                (city.twinName || '').toLowerCase().includes(term) ||
                (city.realLocation || '').toLowerCase().includes(term) ||
                (city.tags || []).some(function (tag) { return tag.toLowerCase().includes(term); });
            return categoryMatch && searchMatch;
        });
    }
};
