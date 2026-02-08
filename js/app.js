document.addEventListener('DOMContentLoaded', function () {
    // 初始化地图
    TwinMap.init();

    // 加载数据
    TwinData.load().then(function () {
        updateMap();
    });

    // 分类筛选
    var checkboxes = document.querySelectorAll('#filter-panel input[type="checkbox"]');
    checkboxes.forEach(function (cb) {
        cb.addEventListener('change', updateMap);
    });

    // 搜索（防抖）
    var searchInput = document.getElementById('search-input');
    var debounceTimer;
    searchInput.addEventListener('input', function () {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(updateMap, 250);
    });

    // 移动端筛选面板切换
    var toggleBtn = document.getElementById('filter-toggle');
    var filterPanel = document.getElementById('filter-panel');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function () {
            filterPanel.classList.toggle('collapsed');
        });
    }

    // === 添加地点功能 ===
    var addBtn = document.getElementById('add-btn');
    var modal = document.getElementById('add-modal');
    var closeBtn = document.getElementById('modal-close');
    var pickBtn = document.getElementById('pick-btn');
    var form = document.getElementById('add-form');

    addBtn.addEventListener('click', function () {
        modal.classList.add('open');
        TwinMap.enterPickMode();
    });

    closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', function (e) {
        if (e.target === modal) closeModal();
    });

    function closeModal() {
        modal.classList.remove('open');
        TwinMap.exitPickMode();
        form.reset();
        document.getElementById('pick-hint').textContent = '点击地图选取位置';
        document.getElementById('image-name').textContent = '';
    }

    pickBtn.addEventListener('click', function () {
        modal.classList.remove('open');
        // Keep pick mode on, user clicks map, then reopen
    });

    // Image file name display
    var imageInput = document.getElementById('add-image');
    imageInput.addEventListener('change', function () {
        var name = this.files[0] ? this.files[0].name : '';
        document.getElementById('image-name').textContent = name;
    });

    // Form submit
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        var lat = document.getElementById('add-lat').value;
        var lng = document.getElementById('add-lng').value;
        if (!lat || !lng) {
            alert('请先在地图上点击选取位置');
            return;
        }

        var submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = '提交中...';

        var formData = new FormData();
        formData.append('twinName', document.getElementById('add-name').value);
        formData.append('realName', document.getElementById('add-real').value);
        formData.append('realLocation', document.getElementById('add-location').value);
        formData.append('category', document.getElementById('add-category').value);
        formData.append('description', document.getElementById('add-desc').value);
        formData.append('tags', document.getElementById('add-tags').value);
        formData.append('lat', lat);
        formData.append('lng', lng);

        var imageFile = document.getElementById('add-image').files[0];
        if (imageFile) {
            formData.append('image', imageFile);
        }

        fetch('/api/cities', {
            method: 'POST',
            body: formData
        })
        .then(function (res) { return res.json(); })
        .then(function (result) {
            if (result.ok) {
                closeModal();
                TwinData.load().then(function () {
                    updateMap();
                    if (result.city) {
                        TwinMap.focusCity(result.city);
                    }
                });
            } else {
                alert(result.error || '提交失败');
            }
        })
        .catch(function () {
            alert('网络错误，请重试');
        })
        .finally(function () {
            submitBtn.disabled = false;
            submitBtn.textContent = '提交';
        });
    });
});

function updateMap() {
    var activeCategories = Array.from(
        document.querySelectorAll('#filter-panel input[type="checkbox"]:checked')
    ).map(function (cb) { return cb.value; });

    var searchTerm = document.getElementById('search-input').value.trim();
    var filtered = TwinData.filter(activeCategories, searchTerm);

    TwinMap.renderMarkers(filtered);

    document.getElementById('city-count').textContent =
        '显示 ' + filtered.length + '/' + TwinData.cities.length + ' 个地点';

    if (searchTerm && filtered.length === 1) {
        TwinMap.focusCity(filtered[0]);
    }
}
