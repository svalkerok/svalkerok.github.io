document.addEventListener('DOMContentLoaded', function() {
    const menuFilters = document.querySelectorAll('.menu-filter');
    const menuCategories = document.querySelector('.menu-categories');
    const menuCategoryItems = document.querySelectorAll('.menu-category');

    // Функция для обновления отображения меню
    function updateMenuDisplay(filterValue) {
        // Сначала уберем все активные классы
        menuCategoryItems.forEach(category => {
            category.classList.remove('active');
        });

        if (filterValue === 'all') {
            // Для "All" показываем все категории и добавляем класс для двухколоночного отображения
            menuCategories.classList.add('show-all');
            menuCategoryItems.forEach(category => {
                category.classList.add('active');
            });
        } else {
            // Для конкретной категории показываем только её и убираем двухколоночное отображение
            menuCategories.classList.remove('show-all');
            const selectedCategory = document.querySelector(`[data-category="${filterValue}"]`);
            if (selectedCategory) {
                selectedCategory.classList.add('active');
            }
        }
    }

    menuFilters.forEach(filter => {
        filter.addEventListener('click', function() {
            // Убрать активный класс со всех фильтров
            menuFilters.forEach(f => f.classList.remove('active'));
            
            // Добавить активный класс на текущий фильтр
            this.classList.add('active');
            
            // Обновить отображение меню
            const filterValue = this.getAttribute('data-filter');
            updateMenuDisplay(filterValue);
        });
    });

    // Активировать первый фильтр (All) по умолчанию
    const defaultFilter = document.querySelector('.menu-filter');
    if (defaultFilter) {
        defaultFilter.click();
    }
});