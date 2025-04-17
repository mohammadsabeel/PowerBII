// Mock Power BI Service
window.powerbi = {
    service: {
        Service: class Service {
            constructor() {
                this.report = null;
            }
            async embed(container, config) {
                this.report = new MockReport(container, config);
                return this.report;
            }
        }
    },
    factories: {
        hpmFactory: {},
        wpmpFactory: {},
        routerFactory: {}
    },
    models: {
        TokenType: {
            Embed: 'Embed'
        }
    }
};

// Mock data for visuals
const mockData = {
    salesData: [
        { month: 'Jan', sales: 1200, target: 1000 },
        { month: 'Feb', sales: 1500, target: 1100 },
        { month: 'Mar', sales: 1800, target: 1200 },
        { month: 'Apr', sales: 1600, target: 1300 },
        { month: 'May', sales: 2000, target: 1400 },
        { month: 'Jun', sales: 2200, target: 1500 }
    ],
    pieData: [
        { category: 'Electronics', value: 35 },
        { category: 'Clothing', value: 25 },
        { category: 'Food', value: 20 },
        { category: 'Other', value: 20 }
    ],
    tableData: [
        { product: 'Laptop', sales: 150, revenue: 75000 },
        { product: 'Phone', sales: 300, revenue: 45000 },
        { product: 'Tablet', sales: 200, revenue: 40000 },
        { product: 'Monitor', sales: 100, revenue: 20000 }
    ]
};

// Mock Report Class
class MockReport {
    constructor(container, config) {
        this.container = container;
        this.config = config;
        this.visuals = [
            { 
                name: 'Sales Trend', 
                visible: true,
                type: 'line-chart',
                data: mockData.salesData
            },
            { 
                name: 'Revenue Distribution', 
                visible: true,
                type: 'pie-chart',
                data: mockData.pieData
            },
            { 
                name: 'Product Performance', 
                visible: true,
                type: 'bar-chart',
                data: mockData.salesData
            },
            { 
                name: 'Sales Details', 
                visible: true,
                type: 'table',
                data: mockData.tableData
            }
        ];
        this.eventHandlers = {};
        this.renderMockReport();
    }

    renderMockReport() {
        const reportHtml = `
            <div style="padding: 20px; background: #f5f5f5; border-radius: 5px;">
                <h2 style="color: #0078d4; margin-bottom: 20px;">Mock Power BI Report</h2>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
                    ${this.visuals.map(visual => `
                        <div id="visual-${visual.name}" style="
                            padding: 20px;
                            background: white;
                            border-radius: 5px;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                            ${!visual.visible ? 'display: none;' : ''}
                        ">
                            <h3 style="color: #323130; margin-top: 0;">${visual.name}</h3>
                            ${this.renderVisual(visual)}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        this.container.innerHTML = reportHtml;
    }

    renderVisual(visual) {
        switch(visual.type) {
            case 'line-chart':
                return this.renderLineChart(visual.data);
            case 'pie-chart':
                return this.renderPieChart(visual.data);
            case 'bar-chart':
                return this.renderBarChart(visual.data);
            case 'table':
                return this.renderTable(visual.data);
            default:
                return '<p>This is a mock visual</p>';
        }
    }

    renderLineChart(data) {
        const maxValue = Math.max(...data.map(d => Math.max(d.sales, d.target)));
        const height = 200;
        const width = 300;
        const padding = 40;

        const points = data.map((d, i) => {
            const x = padding + (i * (width - 2 * padding) / (data.length - 1));
            const ySales = height - padding - (d.sales / maxValue * (height - 2 * padding));
            const yTarget = height - padding - (d.target / maxValue * (height - 2 * padding));
            return { x, ySales, yTarget, month: d.month };
        });

        const pathSales = points.map((p, i) => 
            `${i === 0 ? 'M' : 'L'} ${p.x} ${p.ySales}`
        ).join(' ');

        const pathTarget = points.map((p, i) => 
            `${i === 0 ? 'M' : 'L'} ${p.x} ${p.yTarget}`
        ).join(' ');

        return `
            <svg width="${width}" height="${height}" style="max-width: 100%;">
                <!-- Axes -->
                <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="#ccc" />
                <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" stroke="#ccc" />
                
                <!-- Sales line -->
                <path d="${pathSales}" stroke="#0078d4" stroke-width="2" fill="none" />
                
                <!-- Target line -->
                <path d="${pathTarget}" stroke="#ffaa44" stroke-width="2" stroke-dasharray="5,5" fill="none" />
                
                <!-- Points -->
                ${points.map(p => `
                    <circle cx="${p.x}" cy="${p.ySales}" r="4" fill="#0078d4" />
                    <circle cx="${p.x}" cy="${p.yTarget}" r="4" fill="#ffaa44" />
                `).join('')}
                
                <!-- Labels -->
                ${points.map(p => `
                    <text x="${p.x}" y="${height - padding + 15}" font-size="10" text-anchor="middle">${p.month}</text>
                `).join('')}
            </svg>
            <div style="margin-top: 10px; font-size: 12px; color: #666;">
                <span style="color: #0078d4;">●</span> Sales
                <span style="margin-left: 10px; color: #ffaa44;">●</span> Target
            </div>
        `;
    }

    renderPieChart(data) {
        const size = 200;
        const center = size / 2;
        const radius = size / 2 - 10;
        let currentAngle = 0;

        const paths = data.map(item => {
            const angle = (item.value / 100) * 360;
            const startAngle = currentAngle;
            currentAngle += angle;

            const x1 = center + radius * Math.cos(startAngle * Math.PI / 180);
            const y1 = center + radius * Math.sin(startAngle * Math.PI / 180);
            const x2 = center + radius * Math.cos(currentAngle * Math.PI / 180);
            const y2 = center + radius * Math.sin(currentAngle * Math.PI / 180);

            const largeArcFlag = angle > 180 ? 1 : 0;

            return {
                path: `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`,
                color: this.getRandomColor(),
                label: item.category,
                value: item.value
            };
        });

        return `
            <div style="display: flex; align-items: center;">
                <svg width="${size}" height="${size}" style="max-width: 100%;">
                    ${paths.map(p => `
                        <path d="${p.path}" fill="${p.color}" stroke="white" stroke-width="1" />
                    `).join('')}
                </svg>
                <div style="margin-left: 20px;">
                    ${paths.map(p => `
                        <div style="margin-bottom: 5px;">
                            <span style="color: ${p.color}">●</span> ${p.label} (${p.value}%)
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderBarChart(data) {
        const height = 200;
        const width = 300;
        const padding = 40;
        const barWidth = 30;
        const maxValue = Math.max(...data.map(d => d.sales));

        return `
            <svg width="${width}" height="${height}" style="max-width: 100%;">
                <!-- Axes -->
                <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="#ccc" />
                <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" stroke="#ccc" />
                
                <!-- Bars -->
                ${data.map((d, i) => {
                    const x = padding + (i * (width - 2 * padding) / (data.length - 1)) - barWidth/2;
                    const barHeight = (d.sales / maxValue) * (height - 2 * padding);
                    const y = height - padding - barHeight;
                    return `
                        <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="#0078d4" />
                        <text x="${x + barWidth/2}" y="${height - padding + 15}" font-size="10" text-anchor="middle">${d.month}</text>
                    `;
                }).join('')}
            </svg>
        `;
    }

    renderTable(data) {
        return `
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #f5f5f5;">
                        <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">Product</th>
                        <th style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">Sales</th>
                        <th style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">Revenue</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(row => `
                        <tr>
                            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${row.product}</td>
                            <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">${row.sales}</td>
                            <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">$${row.revenue.toLocaleString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    getRandomColor() {
        const colors = ['#0078d4', '#ffaa44', '#00b7c3', '#ff4343', '#881798', '#107c10'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    async getPages() {
        return [{
            getVisuals: async () => this.visuals
        }];
    }

    async setVisibility(visible) {
        this.visible = visible;
        this.renderMockReport();
    }

    on(event, handler) {
        if (!this.eventHandlers[event]) {
            this.eventHandlers[event] = [];
        }
        this.eventHandlers[event].push(handler);
        
        // Simulate loaded event
        if (event === 'loaded') {
            setTimeout(() => handler(), 1000);
        }
    }
} 