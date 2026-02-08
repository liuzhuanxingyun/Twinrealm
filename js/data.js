const CITY_DATA = {
    cities: [
        {
            id: "cyber-clinic",
            realName: "清新区第二中学",
            realNameEn: "Qingxin No.2 Middle School",
            realLocation: "广东省清远市清新区太和镇",
            realLocationEn: "Taihe, Qingxin, Qingyuan, Guangdong",
            twinName: "赛博诊所",
            twinNameEn: "Cyber Clinic",
            category: "scifi",
            lat: 23.7348,
            lng: 113.0178,
            description: "在清远的小巷深处，一间不起眼的诊所闪烁着霓虹灯光。这里的\"医生\"专门为机械改造者提供义体维护和神经接口调试服务。据说，诊所的地下室通往整个珠三角的赛博朋克地下网络。",
            lore: "由一位退休的神经外科医生和一位黑客共同创立，赛博诊所是清远地下改造社区的核心据点。",
            tags: ["赛博朋克", "义体改造", "地下诊所"]
        }
    ]
};

const TwinData = {
    cities: [],
    categoryColors: {
        rpg: '#D4A017',
        scifi: '#00E5FF',
        fantasy: '#B388FF',
        anime: '#FF6B9D'
    },
    categoryLabels: {
        rpg: 'RPG',
        scifi: '科幻',
        fantasy: '奇幻',
        anime: '动漫'
    },

    load() {
        this.cities = CITY_DATA.cities;
        return this.cities;
    },

    filter(activeCategories, searchTerm) {
        return this.cities.filter(city => {
            const categoryMatch = activeCategories.includes(city.category);
            if (!searchTerm) return categoryMatch;
            const term = searchTerm.toLowerCase();
            const searchMatch =
                city.realName.toLowerCase().includes(term) ||
                city.twinName.toLowerCase().includes(term) ||
                city.realNameEn.toLowerCase().includes(term) ||
                city.twinNameEn.toLowerCase().includes(term) ||
                city.realLocation.toLowerCase().includes(term) ||
                city.tags.some(tag => tag.toLowerCase().includes(term));
            return categoryMatch && searchMatch;
        });
    }
};
