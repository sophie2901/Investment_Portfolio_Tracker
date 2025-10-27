/*GLOBAL VARIABLES*/
let portfolio = [];
let updateStockId = null;

/*INITIALIZATION*/
window.onload = function() {
    // Load saved portfolio from localStorage
    const saved = localStorage.getItem('portfolio');
    if (saved) {
        portfolio = JSON.parse(saved);
        renderPortfolio();
    }

    // Set today's date as default
    const dateInput = document.getElementById('purchaseDate');
    if (dateInput) {
        dateInput.valueAsDate = new Date();
    }
};

/*ADD STOCK FUNCTION*/
function addStock() {
    // Get form values
    const ticker = document.getElementById('ticker').value.trim().toUpperCase();
    const shares = parseFloat(document.getElementById('shares').value);
    const purchasePrice = parseFloat(document.getElementById('purchasePrice').value);
    const currentPrice = parseFloat(document.getElementById('currentPrice').value);
    const purchaseDate = document.getElementById('purchaseDate').value;

    // Validate inputs
    if (!ticker || isNaN(shares) || isNaN(purchasePrice) || isNaN(currentPrice) || !purchaseDate) {
        alert('Please fill all fields');
        return;
    }

    // Create stock object
    const stock = {
        id: Date.now(),
        ticker,
        shares,
        purchasePrice,
        purchaseDate,
        currentPrice
    };

    // Add to portfolio
    portfolio.push(stock);
    
    // Save and render
    savePortfolio();
    renderPortfolio();

    // Clear form
    clearForm();
}

/*UPDATE STOCK PRICE FUNCTIONS*/
function openUpdateModal(id) {
    const stock = portfolio.find(s => s.id === id);
    if (stock) {
        updateStockId = id;
        const modalTicker = document.getElementById('modalTicker');
        const modalPrice = document.getElementById('modalCurrentPrice');
        
        if (modalTicker && modalPrice) {
            modalTicker.textContent = stock.ticker;
            modalPrice.value = stock.currentPrice;
            document.getElementById('updateModal').classList.add('active');
        } else {
            console.error('Modal elements not found');
        }
    }
}

function closeModal() {
    const modal = document.getElementById('updateModal');
    if (modal) {
        modal.classList.remove('active');
    }
    updateStockId = null;
}

function saveUpdatedPrice() {
    console.log('saveUpdatedPrice called');
    console.log('updateStockId:', updateStockId);
    
    const modalPrice = document.getElementById('modalCurrentPrice');
    console.log('modalPrice element:', modalPrice);
    
    if (!modalPrice) {
        console.error('Modal price input not found');
        return;
    }

    const newPrice = parseFloat(modalPrice.value);
    console.log('New price value:', newPrice);
    
    if (isNaN(newPrice) || newPrice <= 0) {
        alert('Please enter a valid price');
        return;
    }

    const stock = portfolio.find(s => s.id === updateStockId);
    console.log('Found stock:', stock);
    
    if (stock) {
        console.log('Old price:', stock.currentPrice);
        stock.currentPrice = newPrice;
        console.log('New price set:', stock.currentPrice);
        savePortfolio();
        renderPortfolio();
        closeModal();
        alert('Price updated successfully!');
    } else {
        console.error('Stock not found with id:', updateStockId);
    }
}

/*DELETE STOCK FUNCTION*/
function deleteStock(id) {
    if (confirm('Delete this position?')) {
        portfolio = portfolio.filter(s => s.id !== id);
        savePortfolio();
        renderPortfolio();
    }
}

/*RENDER PORTFOLIO FUNCTION*/
function renderPortfolio() {
    const content = document.getElementById('portfolioContent');

    if (!content) {
        console.error('Portfolio content element not found');
        return;
    }

    // Check if portfolio is empty
    if (portfolio.length === 0) {
        content.innerHTML = '<div class="empty-state"><p>No stocks yet. Add your first position above!</p></div>';
        updateSummary();
        return;
    }

    // Build table HTML
    let html = `
        <table>
            <thead>
                <tr>
                    <th>Ticker</th>
                    <th>Shares</th>
                    <th>Buy Price</th>
                    <th>Current</th>
                    <th>Cost</th>
                    <th>Value</th>
                    <th>P/L</th>
                    <th>Return</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;

    // Add row for each stock
    portfolio.forEach(s => {
        const cost = s.shares * s.purchasePrice;
        const value = s.shares * s.currentPrice;
        const pl = value - cost;
        const ret = (pl / cost) * 100;
        const cls = pl >= 0 ? 'positive' : 'negative';

        html += `
            <tr>
                <td><strong>${s.ticker}</strong></td>
                <td>${s.shares.toFixed(4)}</td>
                <td>$${s.purchasePrice.toFixed(2)}</td>
                <td>$${s.currentPrice.toFixed(2)}</td>
                <td>$${cost.toFixed(2)}</td>
                <td>$${value.toFixed(2)}</td>
                <td class="${cls}">${pl >= 0 ? '+' : ''}$${pl.toFixed(2)}</td>
                <td class="${cls}">${pl >= 0 ? '+' : ''}${ret.toFixed(2)}%</td>
                <td>
                    <button class="update-btn" onclick="openUpdateModal(${s.id})">Update</button>
                    <button class="delete-btn" onclick="deleteStock(${s.id})">Delete</button>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    content.innerHTML = html;
    
    // Update summary cards
    updateSummary();
}

/*UPDATE SUMMARY FUNCTION*/
function updateSummary() {
    let invested = 0;
    let value = 0;

    // Calculate totals
    portfolio.forEach(s => {
        invested += s.shares * s.purchasePrice;
        value += s.shares * s.currentPrice;
    });

    const ret = value - invested;
    const retPct = invested > 0 ? (ret / invested) * 100 : 0;

    // Update DOM
    const totalInvestedEl = document.getElementById('totalInvested');
    const currentValueEl = document.getElementById('currentValue');
    const retEl = document.getElementById('totalReturn');
    const pctEl = document.getElementById('returnPercent');

    if (totalInvestedEl) totalInvestedEl.textContent = `$${invested.toFixed(2)}`;
    if (currentValueEl) currentValueEl.textContent = `$${value.toFixed(2)}`;
    
    if (retEl) {
        retEl.textContent = `${ret >= 0 ? '+' : ''}$${ret.toFixed(2)}`;
        retEl.className = ret >= 0 ? 'positive' : 'negative';
    }

    if (pctEl) {
        pctEl.textContent = `${retPct >= 0 ? '+' : ''}${retPct.toFixed(2)}%`;
        pctEl.className = retPct >= 0 ? 'positive' : 'negative';
    }
}

/*UTILITY FUNCTIONS*/
function savePortfolio() {
    localStorage.setItem('portfolio', JSON.stringify(portfolio));
}

function clearForm() {
    const ticker = document.getElementById('ticker');
    const shares = document.getElementById('shares');
    const purchasePrice = document.getElementById('purchasePrice');
    const currentPrice = document.getElementById('currentPrice');
    
    if (ticker) ticker.value = '';
    if (shares) shares.value = '';
    if (purchasePrice) purchasePrice.value = '';
    if (currentPrice) currentPrice.value = '';
}