document.addEventListener('DOMContentLoaded', function () {
    // 加载数据
    TwinData.load();

    // 初始化地图
    TwinMap.init();

    // 初始渲染
    updateMap();

    // 分类筛选复选框事件
    var checkboxes = document.querySelectorAll('#filter-panel input[type="checkbox"]');
    checkboxes.forEach(function (cb) {
        cb.addEventListener('change', function () {
            updateMap();
        });
    });

    // 搜索框事件（带防抖）
    var searchInput = document.getElementById('search-input');
    var debounceTimer;
    searchInput.addEventListener('input', function () {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function () {
            updateMap();
        }, 250);
    });

    // 移动端筛选面板切换
    var toggleBtn = document.getElementById('filter-toggle');
    var filterPanel = document.getElementById('filter-panel');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function () {
            filterPanel.classList.toggle('collapsed');
        });
    }
});

function updateMap() {
    var activeCategories = Array.from(
        document.querySelectorAll('#filter-panel input[type="checkbox"]:checked')
    ).map(function (cb) { return cb.value; });

    var searchTerm = document.getElementById('search-input').value.trim();
    var filtered = TwinData.filter(activeCategories, searchTerm);

    TwinMap.renderMarkers(filtered);

    // 更新计数
    document.getElementById('city-count').textContent =
        '显示 ' + filtered.length + '/' + TwinData.cities.length + ' 个城市';

    // 搜索结果只有一个时自动聚焦
    if (searchTerm && filtered.length === 1) {
        TwinMap.focusCity(filtered[0]);
    }
}
