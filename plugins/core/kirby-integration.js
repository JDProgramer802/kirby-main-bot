// 🌸 Kirby Dream Bot - Sistema de Integración Completa
// @nombre: kirby-integration
// @alias: integration, sistema, completo
// @categoria: core
// @descripcion: Sistema completo que integra todas las funciones del bot
// @reaccion: 🌸

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { kirbyCore } from './kirby-core.js';
import { webPanel } from './web-panel.js';

class KirbyIntegration {
    constructor() {
        this.version = '2.0.0';
        this.isRunning = false;
        this.components = {
            core: kirbyCore,
            panel: webPanel,
            database: null,
            storage: null,
            commands: new Map(),
            events: new Map()
        };
        this.config = {
            autoStart: true,
            enablePanel: true,
            enableDatabase: true,
            enableStorage: true
        };
    }

    // 🚀 Inicio completo del sistema
    async start() {
        try {
            console.log('🌸 Iniciando Kirby Dream Bot - Sistema Completo...');
            
            // 1. Iniciar core
            const coreResult = await this.components.core.start();
            if (!coreResult.success) {
                throw new Error(`Error iniciando core: ${coreResult.error}`);
            }
            
            // 2. Iniciar panel web
            if (this.config.enablePanel) {
                const panelResult = await this.components.panel.start();
                if (panelResult.success) {
                    console.log(`🌐 Panel web: ${panelResult.url}`);
                }
            }
            
            // 3. Inicializar base de datos
            if (this.config.enableDatabase) {
                await this.initDatabase();
            }
            
            // 4. Inicializar almacenamiento
            if (this.config.enableStorage) {
                await this.initStorage();
            }
            
            // 5. Cargar comandos
            await this.loadCommands();
            
            // 6. Configurar eventos
            await this.setupEvents();
            
            this.isRunning = true;
            
            const status = await this.getFullStatus();
            console.log('✅ Sistema completo iniciado correctamente');
            console.log(`📊 Estado: ${status.bot.status}`);
            console.log(`🌐 Panel: ${status.panel.url || 'Inactivo'}`);
            console.log(`🗄️ Database: ${status.database.status}`);
            console.log(`📁 Storage: ${status.storage.status}`);
            
            return {
                success: true,
                status: status,
                components: Object.keys(this.components)
            };
            
        } catch (error) {
            console.error('❌ Error iniciando sistema completo:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // 🛑 Detener sistema completo
    async stop() {
        try {
            console.log('🛑 Deteniendo Kirby Dream Bot - Sistema Completo...');
            
            // 1. Detener panel web
            if (this.components.panel.isActive) {
                await this.components.panel.stop();
            }
            
            // 2. Detener core
            await this.components.core.stop();
            
            // 3. Limpiar memoria
            this.cleanup();
            
            this.isRunning = false;
            console.log('✅ Sistema completo detenido');
            
            return { success: true };
            
        } catch (error) {
            console.error('❌ Error deteniendo sistema:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // 📊 Obtener estado completo
    async getFullStatus() {
        try {
            const coreStatus = await this.components.core.getStatus();
            const panelStatus = {
                isActive: this.components.panel.isActive,
                url: this.components.panel.isActive ? `http://localhost:${this.components.panel.port}` : null,
                port: this.components.panel.port
            };
            
            return {
                system: {
                    name: 'Kirby Dream Bot',
                    version: this.version,
                    isRunning: this.isRunning,
                    uptime: Date.now() - this.components.core.startTime.getTime()
                },
                bot: coreStatus.bot,
                database: coreStatus.database,
                storage: coreStatus.storage,
                panel: panelStatus,
                modules: coreStatus.modules,
                stats: this.components.core.getStats()
            };
        } catch (error) {
            return {
                error: error.message
            };
        }
    }

    // 🗄️ Inicializar base de datos
    async initDatabase() {
        try {
            console.log('🗄️ Inicializando base de datos...');
            
            // Verificar conexión
            const dbStatus = await this.components.core.getDatabaseStatus();
            if (dbStatus.status !== 'connected') {
                throw new Error('No se puede conectar a la base de datos');
            }
            
            console.log('✅ Base de datos inicializada');
            
        } catch (error) {
            console.error('❌ Error inicializando base de datos:', error);
            throw error;
        }
    }

    // 📁 Inicializar almacenamiento
    async initStorage() {
        try {
            console.log('📁 Inicializando almacenamiento...');
            
            // Crear directorios necesarios
            const dirs = ['./public/banners', './public/videos', './public/temp'];
            for (const dir of dirs) {
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
            }
            
            console.log('✅ Almacenamiento inicializado');
            
        } catch (error) {
            console.error('❌ Error inicializando almacenamiento:', error);
            throw error;
        }
    }

    // 🎮 Cargar comandos
    async loadCommands() {
        try {
            console.log('🎮 Cargando comandos...');
            
            // Cargar comandos del core
            const coreCommands = this.components.core.commands;
            console.log(`✅ ${coreCommands.size} comandos cargados`);
            
        } catch (error) {
            console.error('❌ Error cargando comandos:', error);
            throw error;
        }
    }

    // 📡 Configurar eventos
    async setupEvents() {
        try {
            console.log('📡 Configurando eventos...');
            
            // Eventos del sistema
            this.events.set('start', []);
            this.events.set('stop', []);
            this.events.set('error', []);
            this.events.set('message', []);
            this.events.set('command', []);
            
            console.log('✅ Eventos configurados');
            
        } catch (error) {
            console.error('❌ Error configurando eventos:', error);
            throw error;
        }
    }

    // 🧹 Limpieza de memoria
    cleanup() {
        this.components.commands.clear();
        this.components.events.clear();
    }

    // 🔄 Reiniciar sistema completo
    async restart() {
        console.log('🔄 Reiniciando sistema completo...');
        
        await this.stop();
        await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar 2 segundos
        return await this.start();
    }

    // 📱 Generar QR integrado
    async generateQR() {
        try {
            const qr = await this.components.core.generateQR();
            
            if (qr.success) {
                // Guardar QR en el sistema
                const qrData = {
                    ...qr,
                    generatedAt: new Date().toISOString(),
                    system: 'kirby-integration',
                    panel: this.components.panel.isActive
                };
                
                fs.writeFileSync('./current-qr.json', JSON.stringify(qrData, null, 2));
                
                return qrData;
            }
            
            return qr;
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // 📊 Ejecutar comando integrado
    async executeCommand(command, ctx) {
        try {
            const result = await this.components.core.executeCommand(command, ctx);
            
            // Emitir evento de comando
            this.emitEvent('command', {
                command: command,
                result: result,
                timestamp: new Date().toISOString()
            });
            
            return result;
        } catch (error) {
            this.emitEvent('error', {
                type: 'command_error',
                command: command,
                error: error.message,
                timestamp: new Date().toISOString()
            });
            
            return {
                success: false,
                error: error.message
            };
        }
    }

    // 📡 Emitir evento
    emitEvent(eventName, data) {
        const listeners = this.events.get(eventName) || [];
        listeners.forEach(listener => {
            try {
                listener(data);
            } catch (error) {
                console.error(`Error en listener de evento ${eventName}:`, error);
            }
        });
    }

    // 👂 Escuchar evento
    on(eventName, listener) {
        if (!this.events.has(eventName)) {
            this.events.set(eventName, []);
        }
        this.events.get(eventName).push(listener);
    }

    // 🎯 Obtener información del sistema
    getSystemInfo() {
        return {
            name: 'Kirby Dream Bot Integration',
            version: this.version,
            components: Object.keys(this.components),
            isRunning: this.isRunning,
            config: this.config,
            features: [
                'Core System',
                'Web Panel',
                'Database Integration',
                'Storage Management',
                'Command System',
                'Event System',
                'QR Generation',
                'Real-time Status'
            ]
        };
    }
}

// Instancia global del sistema de integración
const kirbyIntegration = new KirbyIntegration();

export default async function(m, ctx) {
    const { reply, isOwner } = ctx;
    
    if (!isOwner) {
        return reply('❌ *¡Oops!* Este comando solo está disponible para el dueño del bot. 🌸');
    }
    
    const command = m.body.split(' ')[1];
    
    if (!command) {
        const help = `🌸 **Kirby Integration - Sistema Completo**\n\n` +
            `🚀 **start** - Iniciar sistema completo\n` +
            `🛑 **stop** - Detener sistema completo\n` +
            `🔄 **restart** - Reiniciar sistema completo\n` +
            `📊 **status** - Ver estado completo\n` +
            `📱 **qr** - Generar QR integrado\n` +
            `🌐 **panel** - Ver estado del panel\n` +
            `ℹ️ **info** - Información del sistema\n\n` +
            `💡 **Uso:** /kirby-integration [comando]`;
        
        return reply(help);
    }
    
    try {
        switch (command) {
            case 'start':
                const startResult = await kirbyIntegration.start();
                if (startResult.success) {
                    const status = startResult.status;
                    const message = `🚀 **Sistema Completo Iniciado**\n\n` +
                        `🤖 **Bot:** ${status.bot.name} v${status.bot.version}\n` +
                        `🔥 **Estado:** ${status.bot.status}\n` +
                        `📊 **Uptime:** ${status.bot.uptime}\n` +
                        `🗄️ **Database:** ${status.database.status}\n` +
                        `📁 **Storage:** ${status.storage.status}\n` +
                        `🌐 **Panel:** ${status.panel.url || 'Inactivo'}\n` +
                        `🎮 **Módulos:** ${Object.keys(status.modules).length} activos`;
                    
                    await reply(message);
                } else {
                    await reply(`❌ **Error iniciando sistema:** ${startResult.error}`);
                }
                break;
                
            case 'stop':
                const stopResult = await kirbyIntegration.stop();
                if (stopResult.success) {
                    await reply('🛑 **Sistema Completo Detenido**');
                } else {
                    await reply(`❌ **Error deteniendo sistema:** ${stopResult.error}`);
                }
                break;
                
            case 'restart':
                const restartResult = await kirbyIntegration.restart();
                if (restartResult.success) {
                    const status = restartResult.status;
                    await reply(`🔄 **Sistema Reiniciado**\n\n✅ **Estado:** ${status.bot.status}`);
                } else {
                    await reply(`❌ **Error reiniciando sistema:** ${restartResult.error}`);
                }
                break;
                
            case 'status':
                const fullStatus = await kirbyIntegration.getFullStatus();
                if (fullStatus.error) {
                    await reply(`❌ **Error obteniendo estado:** ${fullStatus.error}`);
                } else {
                    const message = `📊 **Estado Completo del Sistema**\n\n` +
                        `🤖 **Bot:** ${fullStatus.bot.name} v${fullStatus.bot.version}\n` +
                        `🔥 **Estado:** ${fullStatus.bot.status}\n` +
                        `📊 **Uptime:** ${fullStatus.system.uptime}ms\n` +
                        `🗄️ **Database:** ${fullStatus.database.status}\n` +
                        `📁 **Storage:** ${fullStatus.storage.status}\n` +
                        `🌐 **Panel:** ${fullStatus.panel.isActive ? 'Activo' : 'Inactivo'}\n` +
                        `🎮 **Módulos:** ${Object.keys(fullStatus.modules).length}\n` +
                        `📈 **Stats:** ${fullStatus.stats.messages} mensajes, ${fullStatus.stats.commands} comandos`;
                    
                    await reply(message);
                }
                break;
                
            case 'qr':
                const qrResult = await kirbyIntegration.generateQR();
                if (qrResult.success) {
                    const message = `📱 **QR Generado**\n\n` +
                        `🔗 **Código:** \`${qrResult.qr}\`\n` +
                        `⏱️ **Válido por:** ${qrResult.expires}\n` +
                        `🌐 **Panel:** ${qrResult.panel ? 'Activo' : 'Inactivo'}\n\n` +
                        `📋 **Instrucciones:**\n` +
                        `1. Abre WhatsApp\n` +
                        `2. Ve a Ajustes > Dispositivos Vinculados\n` +
                        `3. Escanea este código`;
                    
                    await reply(message);
                } else {
                    await reply(`❌ **Error generando QR:** ${qrResult.error}`);
                }
                break;
                
            case 'panel':
                const panelStatus = kirbyIntegration.components.panel.isActive;
                const panelUrl = panelStatus ? `http://localhost:${kirbyIntegration.components.panel.port}` : 'Inactivo';
                await reply(`🌐 **Estado del Panel Web**\n\n🔗 **URL:** ${panelUrl}\n🚀 **Estado:** ${panelStatus ? 'Activo' : 'Inactivo'}`);
                break;
                
            case 'info':
                const info = kirbyIntegration.getSystemInfo();
                const infoMessage = `ℹ️ **Información del Sistema**\n\n` +
                    `🌸 **Nombre:** ${info.name}\n` +
                    `📦 **Versión:** ${info.version}\n` +
                    `🔥 **Estado:** ${info.isRunning ? 'Activo' : 'Inactivo'}\n` +
                    `🧩 **Componentes:** ${info.components.join(', ')}\n\n` +
                    `🎯 **Características:**\n` +
                    info.features.map(f => `• ${f}`).join('\n');
                
                await reply(infoMessage);
                break;
                
            default:
                await reply(`❌ **Comando desconocido:** ${command}`);
        }
    } catch (error) {
        await reply(`❌ **Error:** ${error.message}`);
    }
}

export { kirbyIntegration };
