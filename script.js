document.addEventListener('DOMContentLoaded', function() {
    const overallProgressBar = document.getElementById('overall-progress-bar');
    let categories = document.querySelectorAll('.category');
    const addItemButton = document.getElementById('add-item-button');
    const newItemText = document.getElementById('new-item-text');
    const newCategoryText = document.getElementById('new-category-text');

    // Load data from local storage
    function loadFromLocalStorage() {
        const savedCategories = JSON.parse(localStorage.getItem('bucketListCategories')) || [];
        savedCategories.forEach(categoryData => {
            addCategory(categoryData.name, categoryData.items);
        });
        updateProgress();
    }

    // Save data to local storage
    function saveToLocalStorage() {
        const categoryData = [];
        categories.forEach(category => {
            const categoryName = category.querySelector('h2').textContent.trim();
            const items = [];
            category.querySelectorAll('.bucket-list-item').forEach(item => {
                items.push({
                    text: item.nextSibling.textContent.trim(),
                    completed: item.checked
                });
            });
            categoryData.push({
                name: categoryName,
                items: items
            });
        });
        localStorage.setItem('bucketListCategories', JSON.stringify(categoryData));
    }

    function updateProgress() {
        const totalItems = document.querySelectorAll('.bucket-list-item').length;
        const completedItems = document.querySelectorAll('.bucket-list-item:checked').length;
        const overallProgress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
        overallProgressBar.style.width = `${overallProgress}%`;

        categories.forEach(category => {
            const progressBar = category.querySelector('.progress-bar');
            const categoryTitle = category.querySelector('h2').textContent.trim();
            const categoryItems = document.querySelectorAll(`.bucket-list-item[data-category="${categoryTitle}"]`);
            const categoryCompletedItems = document.querySelectorAll(`.bucket-list-item[data-category="${categoryTitle}"]:checked`).length;
            const categoryProgress = categoryItems.length > 0 ? (categoryCompletedItems / categoryItems.length) * 100 : 0;
            progressBar.style.width = `${categoryProgress}%`;
        });

        saveToLocalStorage();
    }

    function toggleCategory(header) {
        const categoryList = header.nextElementSibling;
        const isVisible = categoryList.classList.contains('visible');

        if (!isVisible) {
            categoryList.style.height = 'auto';
            const height = categoryList.scrollHeight;
            categoryList.style.height = '0px';
            categoryList.offsetHeight;
            categoryList.style.height = `${height}px`;
            categoryList.style.opacity = '1';
        } else {
            categoryList.style.height = '0px';
            categoryList.style.opacity = '0';
        }

        header.classList.toggle('expanded');
        categoryList.classList.toggle('visible');
    }

    function addCategory(categoryText, items = []) {
        let category = Array.from(categories).find(cat => cat.querySelector('h2').textContent.trim() === categoryText);
        if (!category) {
            category = document.createElement('div');
            category.className = 'category';
            category.innerHTML = `
                <div class="category-header">
                    <h2>${categoryText}</h2>
                    <div class="progress-bar-container">
                        <div class="progress-bar"></div>
                    </div>
                    <button class="delete-category-button">Delete Category</button>
                    <span class="expand-icon">▶</span>
                </div>
                <ul class="category-list"></ul>`;
            document.querySelector('.container').insertBefore(category, document.querySelector('.footer'));
            categories = document.querySelectorAll('.category');
            category.querySelector('.category-header').addEventListener('click', function(event) {
                if (!event.target.closest('.bucket-list-item')) {
                    toggleCategory(this);
                }
            });
        }
        const categoryList = category.querySelector('.category-list');
        items.forEach(item => {
            const newItem = document.createElement('li');
            newItem.innerHTML = `
                <input type="checkbox" class="bucket-list-item" data-category="${categoryText}" ${item.completed ? 'checked' : ''}>
                ${item.text}
                <button class="delete-item-button">Delete</button>`;
            categoryList.appendChild(newItem);
        });

        updateCheckboxEventListeners();
    }

    function addItem() {
        const itemText = newItemText.value.trim();
        const categoryText = newCategoryText.value.trim();
        if (!itemText || !categoryText) {
            alert('Please enter both item and category.');
            return;
        }

        addCategory(categoryText, [{ text: itemText, completed: false }]);
        newItemText.value = '';
        newCategoryText.value = '';
        updateProgress();
    }

    function deleteItem(event) {
        if (event.target.classList.contains('delete-item-button')) {
            const listItem = event.target.closest('li');
            listItem.remove();
            updateProgress();
        }
    }

    function deleteCategory(event) {
        if (event.target.classList.contains('delete-category-button')) {
            const category = event.target.closest('.category');
            const categoryItems = category.querySelectorAll('.bucket-list-item');
            if (categoryItems.length === 0 || confirm('Are you sure you want to delete this category?')) {
                category.remove();
                categories = document.querySelectorAll('.category');
                updateProgress();
            }
        }
    }

    function updateCheckboxEventListeners() {
        document.querySelectorAll('.bucket-list-item').forEach(item => {
            if (!item.hasAttribute('data-listened')) {
                item.addEventListener('change', function() {
                    updateProgress();
                });
                item.setAttribute('data-listened', 'true');
            }
        });

        document.querySelectorAll('.delete-item-button').forEach(button => {
            if (!button.hasAttribute('data-listened')) {
                button.addEventListener('click', deleteItem);
                button.setAttribute('data-listened', 'true');
            }
        });

        document.querySelectorAll('.delete-category-button').forEach(button => {
            if (!button.hasAttribute('data-listened')) {
                button.addEventListener('click', deleteCategory);
                button.setAttribute('data-listened', 'true');
            }
        });
    }

    document.querySelectorAll('.category-header').forEach(header => {
        header.addEventListener('click', function(event) {
            if (!event.target.closest('.bucket-list-item')) {
                toggleCategory(this);
            }
        });
    });

    addItemButton.addEventListener('click', addItem);
    loadFromLocalStorage();
    updateProgress();
    updateCheckboxEventListeners();
});
