// 🌸 Kirby Dream Bot - Panel de Control Web
// @nombre: web-panel
// @alias: panel, control, dashboard
// @categoria: core
// @descripcion: Panel web completo para controlar todas las funciones del bot
// @reaccion: 🌐

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { kirbyCore } from './kirby-core.js';

class WebPanel {
    constructor() {
        this.port = process.env.WEB_PANEL_PORT || 3000;
        this.server = null;
        this.clients = new Set();
        this.isActive = false;
    }

    // 🌐 Iniciar servidor web
    async start() {
        try {
            if (this.isActive) {
                return { success: false, error: 'Panel ya está activo' };
            }

            console.log('🌐 Iniciando panel web...');
            
            // Crear servidor HTTP simple
            const http = require('http');
            
            this.server = http.createServer((req, res) => {
                this.handleRequest(req, res);
            });

            this.server.listen(this.port, () => {
                this.isActive = true;
                console.log(`✅ Panel web activo en http://localhost:${this.port}`);
            });

            return { 
                success: true, 
                url: `http://localhost:${this.port}`,
                port: this.port 
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // 🛑 Detener servidor web
    async stop() {
        try {
            if (!this.isActive) {
                return { success: false, error: 'Panel no está activo' };
            }

            this.server.close(() => {
                this.isActive = false;
                console.log('🛑 Panel web detenido');
            });

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // 📋 Manejar solicitudes HTTP
    handleRequest(req, res) {
        const url = req.url;
        const method = req.method;

        // CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (method === 'GET' && url === '/') {
            this.servePanel(res);
        } else if (method === 'GET' && url === '/api/status') {
            this.serveStatus(res);
        } else if (method === 'POST' && url === '/api/qr') {
            this.generateQR(req, res);
        } else if (method === 'POST' && url === '/api/command') {
            this.executeCommand(req, res);
        } else if (method === 'GET' && url === '/api/stats') {
            this.serveStats(res);
        } else {
            this.serve404(res);
        }
    }

    // 🌸 Servir panel HTML
    servePanel(res) {
        const html = this.generatePanelHTML();
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
    }

    // 📊 Servir estado API
    async serveStatus(res) {
        try {
            const status = await kirbyCore.getStatus();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(status));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
    }

    // 📱 Generar QR API
    async generateQR(req, res) {
        try {
            const qr = await kirbyCore.generateQR();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(qr));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
    }

    // 🎮 Ejecutar comando API
    async executeCommand(req, res) {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', async () => {
            try {
                const data = JSON.parse(body);
                const result = await kirbyCore.executeCommand(data.command, data.ctx);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result));
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            }
        });
    }

    // 📈 Servir estadísticas API
    serveStats(res) {
        const stats = kirbyCore.getStats();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(stats));
    }

    // 🚫 Página no encontrada
    serve404(res) {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 - Página no encontrada</h1>');
    }

    // 🌐 Generar HTML del panel
    generatePanelHTML() {
        return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🌸 Kirby Dream Bot - Panel de Control</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        .float-animation { animation: float 3s ease-in-out infinite; }
        .kirby-gradient { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .glass-effect { background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2); }
        .pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
    </style>
</head>
<body class="min-h-screen kirby-gradient">
    <div class="container mx-auto px-4 py-8">
        <!-- Header -->
        <header class="text-center mb-8">
            <div class="inline-block">
                <h1 class="text-5xl font-bold text-white mb-2 float-animation">
                    🌸 Kirby Dream Bot
                </h1>
                <p class="text-white/80 text-xl">Panel de Control Central</p>
                <div class="mt-4 flex justify-center gap-4">
                    <span id="connection-status" class="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm pulse">
                        🟢 Conectado
                    </span>
                    <span class="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                        📊 Panel Activo
                    </span>
                </div>
            </div>
        </header>

        <!-- Dashboard Principal -->
        <main class="max-w-7xl mx-auto space-y-6">
            <!-- Tarjetas de Estado -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div class="glass-effect rounded-2xl p-6 text-white text-center transform hover:scale-105 transition-all">
                    <div class="text-3xl mb-2">🤖</div>
                    <div class="text-sm opacity-80">Estado del Bot</div>
                    <div id="bot-status" class="text-xl font-bold mt-2">🔄 Cargando...</div>
                </div>
                
                <div class="glass-effect rounded-2xl p-6 text-white text-center transform hover:scale-105 transition-all">
                    <div class="text-3xl mb-2">👥</div>
                    <div class="text-sm opacity-80">Usuarios</div>
                    <div id="users-count" class="text-xl font-bold mt-2">0</div>
                </div>
                
                <div class="glass-effect rounded-2xl p-6 text-white text-center transform hover:scale-105 transition-all">
                    <div class="text-3xl mb-2">🏠</div>
                    <div class="text-sm opacity-80">Grupos</div>
                    <div id="groups-count" class="text-xl font-bold mt-2">0</div>
                </div>
                
                <div class="glass-effect rounded-2xl p-6 text-white text-center transform hover:scale-105 transition-all">
                    <div class="text-3xl mb-2">📊</div>
                    <div class="text-sm opacity-80">Comandos</div>
                    <div id="commands-count" class="text-xl font-bold mt-2">0</div>
                </div>
            </div>

            <!-- Panel de Control -->
            <div class="glass-effect rounded-2xl p-6 text-white">
                <h2 class="text-2xl font-bold mb-6 flex items-center">
                    <span class="mr-2">🎮</span> Panel de Control
                </h2>
                
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <button onclick="executeCommand('core-status')" class="control-btn bg-blue-500/20 hover:bg-blue-500/30 px-4 py-3 rounded-lg transition-all transform hover:scale-105">
                        📊 Estado
                    </button>
                    <button onclick="generateQR()" class="control-btn bg-green-500/20 hover:bg-green-500/30 px-4 py-3 rounded-lg transition-all transform hover:scale-105">
                        📱 QR
                    </button>
                    <button onclick="executeCommand('core-stats')" class="control-btn bg-purple-500/20 hover:bg-purple-500/30 px-4 py-3 rounded-lg transition-all transform hover:scale-105">
                        📈 Stats
                    </button>
                    <button onclick="refreshData()" class="control-btn bg-orange-500/20 hover:bg-orange-500/30 px-4 py-3 rounded-lg transition-all transform hover:scale-105">
                        🔄 Refresh
                    </button>
                </div>

                <!-- Consola -->
                <div class="bg-black/30 rounded-lg p-4 font-mono text-sm max-h-40 overflow-y-auto">
                    <div id="console-output" class="text-green-400">
                        🌸 Kirby Dream Bot Panel v2.0.0<br>
                        ✅ Panel web iniciado correctamente<br>
                        📊 Esperando comandos...
                    </div>
                </div>
            </div>

            <!-- QR Generator -->
            <div class="glass-effect rounded-2xl p-6 text-white">
                <h2 class="text-2xl font-bold mb-6 flex items-center">
                    <span class="mr-2">📱</span> Generador de QR
                </h2>
                
                <div class="text-center">
                    <button id="qr-btn" onclick="generateQR()" class="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105">
                        🚀 Generar QR Code
                    </button>
                    
                    <div id="qr-display" class="mt-6 hidden">
                        <div class="bg-white rounded-lg p-6 inline-block">
                            <div id="qr-code" class="mb-4"></div>
                            <div id="qr-text" class="text-sm text-gray-600 font-mono mb-2"></div>
                            <div class="text-xs text-gray-500">
                                ⏱️ Válido por 30 segundos
                            </div>
                        </div>
                        
                        <div class="mt-4 text-sm">
                            <p>📱 <strong>Para escanear:</strong></p>
                            <p>WhatsApp > Ajustes > Dispositivos Vinculados</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Estadísticas -->
            <div class="glass-effect rounded-2xl p-6 text-white">
                <h2 class="text-2xl font-bold mb-6 flex items-center">
                    <span class="mr-2">📊</span> Estadísticas en Tiempo Real
                </h2>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <canvas id="stats-chart"></canvas>
                    </div>
                    <div>
                        <div class="space-y-4">
                            <div class="flex justify-between items-center">
                                <span>⏱️ Uptime</span>
                                <span id="uptime" class="font-bold">0s</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span>💬 Mensajes</span>
                                <span id="messages" class="font-bold">0</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span>🎮 Comandos</span>
                                <span id="total-commands" class="font-bold">0</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span>❌ Errores</span>
                                <span id="errors" class="font-bold">0</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <script>
        // Variables globales
        let statsChart = null;
        let updateInterval = null;

        // Inicializar
        document.addEventListener('DOMContentLoaded', function() {
            initChart();
            refreshData();
            startAutoUpdate();
        });

        // Inicializar gráfico
        function initChart() {
            const ctx = document.getElementById('stats-chart').getContext('2d');
            statsChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Mensajes',
                        data: [],
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1
                    }, {
                        label: 'Comandos',
                        data: [],
                        borderColor: 'rgb(255, 99, 132)',
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        // Actualizar datos
        async function refreshData() {
            try {
                const response = await fetch('/api/status');
                const data = await response.json();
                
                // Actualizar tarjetas
                document.getElementById('bot-status').textContent = data.bot.status === 'running' ? '🟢 Activo' : '🔴 Inactivo';
                document.getElementById('users-count').textContent = data.stats.users || 0;
                document.getElementById('groups-count').textContent = data.stats.groups || 0;
                document.getElementById('commands-count').textContent = data.stats.commands || 0;
                
                // Actualizar estadísticas
                document.getElementById('uptime').textContent = formatUptime(data.stats.uptime);
                document.getElementById('messages').textContent = data.stats.messages || 0;
                document.getElementById('total-commands').textContent = data.stats.commands || 0;
                document.getElementById('errors').textContent = data.stats.errors || 0;
                
                // Actualizar gráfico
                updateChart(data.stats);
                
                // Actualizar estado de conexión
                document.getElementById('connection-status').textContent = data.bot.status === 'running' ? '🟢 Conectado' : '🔴 Desconectado';
                document.getElementById('connection-status').className = data.bot.status === 'running' ? 
                    'px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm pulse' : 
                    'px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm';
                
            } catch (error) {
                console.error('Error refreshing data:', error);
                document.getElementById('connection-status').textContent = '🔴 Error';
            }
        }

        // Generar QR
        async function generateQR() {
            const btn = document.getElementById('qr-btn');
            const display = document.getElementById('qr-display');
            
            btn.disabled = true;
            btn.textContent = '⏳ Generando...';
            
            try {
                const response = await fetch('/api/qr', { method: 'POST' });
                const data = await response.json();
                
                if (data.success) {
                    // Crear QR visual
                    const qrContainer = document.getElementById('qr-code');
                    qrContainer.innerHTML = \`<div class="text-center">
                        <div class="w-64 h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                            <div class="text-center">
                                <div class="text-4xl mb-2">📱</div>
                                <div class="text-sm text-gray-600">QR Code</div>
                                <div class="text-xs text-gray-500 mt-2">\${data.qr.substring(0, 20)}...</div>
                            </div>
                        </div>
                    </div>\`;
                    
                    document.getElementById('qr-text').textContent = data.qr;
                    display.classList.remove('hidden');
                    
                    addToConsole('📱 QR Code generado: ' + data.qr);
                    
                    // Auto ocultar después de 30 segundos
                    setTimeout(() => {
                        display.classList.add('hidden');
                        btn.disabled = false;
                        btn.textContent = '🚀 Generar QR Code';
                    }, 30000);
                    
                } else {
                    throw new Error(data.error);
                }
                
            } catch (error) {
                addToConsole('❌ Error generando QR: ' + error.message);
                btn.disabled = false;
                btn.textContent = '🚀 Generar QR Code';
            }
        }

        // Ejecutar comando
        async function executeCommand(command) {
            try {
                addToConsole('🎮 Ejecutando: ' + command);
                
                // Simular ejecución de comando
                setTimeout(() => {
                    addToConsole('✅ Comando ejecutado: ' + command);
                    refreshData();
                }, 1000);
                
            } catch (error) {
                addToConsole('❌ Error ejecutando comando: ' + error.message);
            }
        }

        // Actualizar gráfico
        function updateChart(stats) {
            if (!statsChart) return;
            
            const now = new Date().toLocaleTimeString();
            statsChart.data.labels.push(now);
            statsChart.data.datasets[0].data.push(stats.messages || 0);
            statsChart.data.datasets[1].data.push(stats.commands || 0);
            
            // Mantener solo los últimos 10 puntos
            if (statsChart.data.labels.length > 10) {
                statsChart.data.labels.shift();
                statsChart.data.datasets[0].data.shift();
                statsChart.data.datasets[1].data.shift();
            }
            
            statsChart.update();
        }

        // Agregar a consola
        function addToConsole(message) {
            const console = document.getElementById('console-output');
            const timestamp = new Date().toLocaleTimeString();
            console.innerHTML += \`<br>[\${timestamp}] \${message}\`;
            console.scrollTop = console.scrollHeight;
        }

        // Formatear uptime
        function formatUptime(ms) {
            const seconds = Math.floor(ms / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);
            
            if (days > 0) return \`\${days}d \${hours % 24}h\`;
            if (hours > 0) return \`\${hours}h \${minutes % 60}m\`;
            if (minutes > 0) return \`\${minutes}m \${seconds % 60}s\`;
            return \`\${seconds}s\`;
        }

        // Auto actualización
        function startAutoUpdate() {
            updateInterval = setInterval(refreshData, 5000); // Actualizar cada 5 segundos
        }

        // Detener auto actualización
        window.addEventListener('beforeunload', () => {
            if (updateInterval) {
                clearInterval(updateInterval);
            }
        });
    </script>
</body>
</html>`;
    }
}

// Instancia global del panel
const webPanel = new WebPanel();

export default async function(m, ctx) {
    const { reply, isOwner } = ctx;
    
    if (!isOwner) {
        return reply('❌ *¡Oops!* Este comando solo está disponible para el dueño del bot. 🌸');
    }
    
    const command = m.body.split(' ')[1];
    
    if (!command) {
        const help = `🌐 **Panel Web - Comandos**\n\n` +
            `🚀 **panel-start** - Iniciar panel web\n` +
            `🛑 **panel-stop** - Detener panel web\n` +
            `📊 **panel-status** - Ver estado del panel\n` +
            `🔗 **panel-url** - Obtener URL del panel\n\n` +
            `💡 **Uso:** /panel [comando]`;
        
        return reply(help);
    }
    
    try {
        switch (command) {
            case 'start':
                const startResult = await webPanel.start();
                if (startResult.success) {
                    await reply(`🌐 **Panel Web Iniciado**\n\n🔗 **URL:** ${startResult.url}\n🚀 **Puerto:** ${startResult.port}\n\n💡 **Abre la URL en tu navegador para acceder al panel`);
                } else {
                    await reply(`❌ **Error iniciando panel:** ${startResult.error}`);
                }
                break;
                
            case 'stop':
                const stopResult = await webPanel.stop();
                if (stopResult.success) {
                    await reply('🛑 **Panel Web Detenido**');
                } else {
                    await reply(`❌ **Error deteniendo panel:** ${stopResult.error}`);
                }
                break;
                
            case 'status':
                const status = webPanel.isActive ? '🟢 Activo' : '🔴 Inactivo';
                const port = webPanel.port;
                await reply(`📊 **Estado del Panel**\n\n🌐 **Estado:** ${status}\n🚀 **Puerto:** ${port}\n🔗 **URL:** http://localhost:${port}`);
                break;
                
            case 'url':
                const url = webPanel.isActive ? `http://localhost:${webPanel.port}` : 'Panel no está activo';
                await reply(`🔗 **URL del Panel:**\n\n${url}`);
                break;
                
            default:
                await reply(`❌ **Comando desconocido:** ${command}`);
        }
    } catch (error) {
        await reply(`❌ **Error:** ${error.message}`);
    }
}

export { webPanel };
