document.addEventListener('DOMContentLoaded', function() {
    // Cache DOM elements
    const hrTablesList = document.querySelector('.hr-tables');
    const payrollTablesList = document.querySelector('.payroll-tables');
    const tableTitle = document.getElementById('tableTitle');
    const tableHeaders = document.getElementById('tableHeaders');
    const tableBody = document.getElementById('tableBody');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const addButton = document.getElementById('addButton');
    const recordModal = new bootstrap.Modal(document.getElementById('recordModal'));
    const recordForm = document.getElementById('recordForm');
    const modalTitle = document.getElementById('modalTitle');
    const saveButton = document.getElementById('saveButton');

    // State management
    let activeItem = null;
    let currentDatabase = null;
    let currentTable = null;
    let currentSchema = null;

    // Fetch tables from both databases
    async function fetchTables() {
        try {
            showLoading(true);
            const response = await fetch('/api/tables');
            const data = await response.json();
            
            // Populate HR tables
            data.hr_system.forEach(table => {
                const li = createTableListItem(table, 'hr');
                hrTablesList.appendChild(li);
            });

            // Populate Payroll tables
            data.payroll_system.forEach(table => {
                const li = createTableListItem(table, 'payroll');
                payrollTablesList.appendChild(li);
            });
        } catch (error) {
            console.error('Error fetching tables:', error);
            showError('Failed to load database tables');
        } finally {
            showLoading(false);
        }
    }

    // Create table list item with icon
    function createTableListItem(tableName, database) {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex align-items-center';
        
        // Add appropriate icon based on table name
        let icon = 'table';
        if (tableName.includes('employee')) icon = 'person';
        if (tableName.includes('department')) icon = 'buildings';
        if (tableName.includes('salary')) icon = 'cash';
        if (tableName.includes('attendance')) icon = 'calendar-check';
        if (tableName.includes('leave')) icon = 'calendar-minus';
        if (tableName.includes('position')) icon = 'briefcase';
        
        li.innerHTML = `
            <i class="bi bi-${icon} me-2"></i>
            <span>${formatTableName(tableName)}</span>
        `;
        
        li.setAttribute('data-database', database);
        li.setAttribute('data-table', tableName);
        
        li.addEventListener('click', async function() {
            if (activeItem) {
                activeItem.classList.remove('active');
            }
            this.classList.add('active');
            activeItem = this;

            currentDatabase = database;
            currentTable = tableName;

            const formattedTitle = `${formatDatabaseName(database)} - ${formatTableName(tableName)}`;
            tableTitle.innerHTML = `<i class="bi bi-${icon} me-2"></i><span>${formattedTitle}</span>`;
            
            await fetchTableSchema();
            await loadTableData();
            addButton.classList.remove('d-none');
        });

        return li;
    }

    // Fetch table schema
    async function fetchTableSchema() {
        try {
            const response = await fetch(`/api/schema/${currentDatabase}/${currentTable}`);
            const data = await response.json();
            currentSchema = data.columns;
        } catch (error) {
            console.error('Error fetching schema:', error);
            showError('Failed to load table schema');
        }
    }

    // Load table data
    async function loadTableData() {
        showLoading(true);
        try {
            const response = await fetch(`/api/data/${currentDatabase}/${currentTable}`);
            const data = await response.json();
            
            if (data.length === 0) {
                showEmptyState();
                return;
            }

            // Set headers
            const headers = Object.keys(data[0]);
            tableHeaders.innerHTML = headers
                .map(header => `<th>${formatColumnName(header)}</th>`)
                .join('');

            // Set body
            tableBody.innerHTML = data
                .map(row => `
                    <tr>
                        ${headers.map(header => {
                            let value = row[header];
                            // Format different data types
                            if (value === null || value === undefined) {
                                return '<td>-</td>';
                            }
                            // Format date values
                            if (typeof value === 'string' && value.includes('T')) {
                                try {
                                    const date = new Date(value);
                                    if (!isNaN(date)) {
                                        value = date.toLocaleDateString('vi-VN');
                                    }
                                } catch (e) {}
                            }
                            // Format boolean values
                            if (typeof value === 'boolean') {
                                return `<td><i class="bi bi-${value ? 'check-circle-fill text-success' : 'x-circle-fill text-danger'}"></i></td>`;
                            }
                            // Format number values
                            if (typeof value === 'number') {
                                if (header.includes('salary') || header.includes('amount')) {
                                    return `<td>${value.toLocaleString('vi-VN')} ₫</td>`;
                                }
                                return `<td>${value.toLocaleString('vi-VN')}</td>`;
                            }
                            return `<td>${value}</td>`;
                        }).join('')}
                    </tr>
                `)
                .join('');

        } catch (error) {
            console.error('Error loading table data:', error);
            showError('Failed to load table data');
        } finally {
            showLoading(false);
        }
    }

    // Add new record
    window.addRecord = async function() {
        modalTitle.textContent = 'Add New Record';
        
        // Fetch next available ID
        try {
            const response = await fetch(`/api/next-id/${currentDatabase}/${currentTable}`);
            const data = await response.json();
            const nextId = data.nextId;
            generateForm(null, nextId);
        } catch (error) {
            console.error('Error fetching next ID:', error);
            generateForm();
        }
        
        recordModal.show();
    };

    // Generate form based on schema
    function generateForm(data = null, nextId = null) {
        recordForm.innerHTML = currentSchema
            .map(col => {
                if (col.Field === 'id') {
                    if (nextId !== null) {
                        return `
                            <div class="mb-3">
                                <label class="form-label">ID</label>
                                <input type="number" class="form-control" name="id" value="${nextId}" readonly disabled>
                            </div>
                        `;
                    }
                    return '';
                }
                const value = data ? data[col.Field] : '';
                const isRequired = col.Null === 'NO';
                let input;

                if (col.Type.includes('text')) {
                    input = `<textarea class="form-control" name="${col.Field}" ${isRequired ? 'required' : ''}>${value || ''}</textarea>`;
                } else if (col.Type.includes('tinyint(1)')) {
                    input = `
                        <select class="form-control" name="${col.Field}" ${isRequired ? 'required' : ''}>
                            <option value="1" ${value === 1 ? 'selected' : ''}>Yes</option>
                            <option value="0" ${value === 0 ? 'selected' : ''}>No</option>
                        </select>
                    `;
                } else if (col.Type.includes('date')) {
                    const dateValue = value ? new Date(value).toISOString().split('T')[0] : '';
                    input = `<input type="date" class="form-control" name="${col.Field}" value="${dateValue}" ${isRequired ? 'required' : ''}>`;
                } else if (col.Type.includes('int')) {
                    input = `<input type="number" class="form-control" name="${col.Field}" value="${value || ''}" ${isRequired ? 'required' : ''}>`;
                } else {
                    input = `<input type="text" class="form-control" name="${col.Field}" value="${value || ''}" ${isRequired ? 'required' : ''}>`;
                }

                return `
                    <div class="mb-3">
                        <label class="form-label">${formatColumnName(col.Field)}</label>
                        ${input}
                    </div>
                `;
            })
            .join('');
    }

    // Save record
    async function saveRecord() {
        const formData = new FormData(recordForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch(`/api/data/${currentDatabase}/${currentTable}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Failed to save record');

            recordModal.hide();
            await loadTableData();
        } catch (error) {
            console.error('Error saving record:', error);
            alert('Failed to save record');
        }
    }

    // Utility functions
    function formatDatabaseName(database) {
        return database === 'hr' ? 'HR System' : 'Payroll System';
    }

    function formatTableName(name) {
        return name
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    function formatColumnName(name) {
        return name
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    function showLoading(show) {
        loadingSpinner.classList.toggle('d-none', !show);
        if (show) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="100%" class="text-center py-5">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <div class="mt-2 text-muted">Loading data...</div>
                    </td>
                </tr>
            `;
        }
    }

    function showEmptyState() {
        tableHeaders.innerHTML = '';
        tableBody.innerHTML = `
            <tr>
                <td colspan="100%" class="text-center py-5">
                    <i class="bi bi-inbox text-muted" style="font-size: 2rem;"></i>
                    <div class="mt-2 text-muted">No data available in this table</div>
                </td>
            </tr>
        `;
    }

    function showError(message) {
        tableHeaders.innerHTML = '';
        tableBody.innerHTML = `
            <tr>
                <td colspan="100%" class="text-center py-5">
                    <i class="bi bi-exclamation-circle text-danger" style="font-size: 2rem;"></i>
                    <div class="mt-2 text-danger">${message}</div>
                    <button class="btn btn-outline-primary mt-3" onclick="location.reload()">
                        <i class="bi bi-arrow-clockwise me-2"></i>Reload Page
                    </button>
                </td>
            </tr>
        `;
    }

    // Event listeners
    addButton.addEventListener('click', () => window.addRecord());
    saveButton.addEventListener('click', () => saveRecord());

    // Initialize
    fetchTables();
});
