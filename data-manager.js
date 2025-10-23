// data-manager.js - VERSIÓN CORREGIDA
class DataManager {
    constructor() {
        this.initializeData();
    }

    initializeData() {
        if (!localStorage.getItem('barberApp')) {
            const initialData = {
                config: {
                    currency: "COP",
                    decimales: false,
                    businessName: "Mi Barbería",
                    whatsappMessage: "¡Hola {nombre}! Tenemos una promoción especial para ti. ¿Te interesa? 😊"
                },
                servicios: [
                    { id: 1, nombre: "Corte", precio: 15000, duracion: 30, activo: true, tipo: "servicio" },
                    { id: 2, nombre: "Corte y Barba", precio: 20000, duracion: 45, activo: true, tipo: "servicio" },
                    { id: 3, nombre: "Barba", precio: 8000, duracion: 20, activo: true, tipo: "servicio" }
                ],
                barberos: [ // 👈 ESTE ARRAY FALTABA
                    { id: 1, nombre: "Carlos Rodríguez", especialidad: "Cortes modernos", telefono: "573001234567", comision: 50, estado: "activo" },
                    { id: 2, nombre: "Juan Pérez", especialidad: "Barbas y acabados", telefono: "573007654321", comision: 45, estado: "activo" }
                ],
                promociones: [ // 👈 ESTE ARRAY FALTABA
                    { id: 1, nombre: "2do Corte 50%", mensaje: "¡Hola {nombre}! Tu segundo corte con 50% de descuento 🎉", activa: true },
                    { id: 2, nombre: "Combo Completo", mensaje: "¡Hola {nombre}! Corte + Barba + Mascarilla por solo $25,000 💈", activa: true }
                ],
                clientes: [],
                inventario: [],
                serviciosRealizados: [],
                ventas: [],
                citas: []
            };
            this.saveData(initialData);
        }
    }

    getData() {
        const data = JSON.parse(localStorage.getItem('barberApp')) || {};
        // Asegurarnos de que todos los arrays existan
        return {
            config: data.config || { currency: "COP", decimales: false },
            servicios: data.servicios || [],
            barberos: data.barberos || [], // 👈 GARANTIZAR QUE EXISTA
            promociones: data.promociones || [], // 👈 GARANTIZAR QUE EXISTA
            clientes: data.clientes || [],
            inventario: data.inventario || [],
            serviciosRealizados: data.serviciosRealizados || [],
            ventas: data.ventas || [],
            citas: data.citas || []
        };
    }

    saveData(data) {
        localStorage.setItem('barberApp', JSON.stringify(data));
    }

    // EXPORTAR/IMPORTAR DATOS
    exportData() {
        const data = this.getData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup-barberia-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    importData(file, callback) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                this.saveData(data);
                callback(true, 'Datos importados exitosamente');
            } catch (error) {
                callback(false, 'Error: Archivo JSON inválido');
            }
        };
        reader.readAsText(file);
    }

    // REGISTRO DE DATOS HISTÓRICOS
    addDatosHistoricos(datos) {
        const data = this.getData();
        
        // Agregar clientes históricos
        if (datos.clientes) {
            data.clientes = [...data.clientes, ...datos.clientes];
        }
        
        // Agregar servicios históricos
        if (datos.serviciosRealizados) {
            data.serviciosRealizados = [...data.serviciosRealizados, ...datos.serviciosRealizados];
        }
        
        this.saveData(data);
    }

    // BARBEROS - FUNCIONES CORREGIDAS
    getBarberos() { 
        const data = this.getData();
        return data.barberos || []; 
    }
    
    addBarbero(barbero) {
        const data = this.getData();
        barbero.id = this.generateId();
        
        // Asegurarnos de que el array de barberos existe
        if (!data.barberos) {
            data.barberos = [];
        }
        
        data.barberos.push(barbero);
        this.saveData(data);
        return barbero.id;
    }

    updateBarbero(id, updates) {
        const data = this.getData();
        if (!data.barberos) return false;
        
        const index = data.barberos.findIndex(b => b.id === id);
        if (index !== -1) {
            data.barberos[index] = { ...data.barberos[index], ...updates };
            this.saveData(data);
            return true;
        }
        return false;
    }

    // PROMOCIONES - FUNCIONES CORREGIDAS
    getPromociones() { 
        const data = this.getData();
        return data.promociones || []; 
    }
    
    addPromocion(promocion) {
        const data = this.getData();
        promocion.id = this.generateId();
        
        // Asegurarnos de que el array de promociones existe
        if (!data.promociones) {
            data.promociones = [];
        }
        
        data.promociones.push(promocion);
        this.saveData(data);
        return promocion.id;
    }

    updatePromocion(id, updates) {
        const data = this.getData();
        if (!data.promociones) return false;
        
        const index = data.promociones.findIndex(p => p.id === id);
        if (index !== -1) {
            data.promociones[index] = { ...data.promociones[index], ...updates };
            this.saveData(data);
            return true;
        }
        return false;
    }

    // CLIENTES
    getClientes() { 
        const data = this.getData();
        return data.clientes || []; 
    }
    
    addCliente(cliente) {
        const data = this.getData();
        cliente.id = this.generateId();
        cliente.fechaRegistro = new Date().toISOString().split('T')[0];
        cliente.totalVisitas = 0;
        cliente.totalGastado = 0;
        
        if (!data.clientes) {
            data.clientes = [];
        }
        
        data.clientes.push(cliente);
        this.saveData(data);
        return cliente.id;
    }

    updateCliente(id, updates) {
        const data = this.getData();
        if (!data.clientes) return false;
        
        const index = data.clientes.findIndex(c => c.id === id);
        if (index !== -1) {
            data.clientes[index] = { ...data.clientes[index], ...updates };
            this.saveData(data);
            return true;
        }
        return false;
    }

    // SERVICIOS
    getServicios() { 
        const data = this.getData();
        return data.servicios || []; 
    }
    
    addServicio(servicio) {
        const data = this.getData();
        servicio.id = this.generateId();
        servicio.activo = true;
        
        if (!data.servicios) {
            data.servicios = [];
        }
        
        data.servicios.push(servicio);
        this.saveData(data);
        return servicio.id;
    }

    // SERVICIOS REALIZADOS
    getServiciosRealizados() { 
        const data = this.getData();
        return data.serviciosRealizados || []; 
    }
    
    addServicioRealizado(servicio) {
        const data = this.getData();
        servicio.id = this.generateId();
        servicio.fecha = servicio.fecha || new Date().toISOString().split('T')[0];
        servicio.estado = "completado";
        
        if (!data.serviciosRealizados) {
            data.serviciosRealizados = [];
        }
        
        data.serviciosRealizados.push(servicio);
        
        // Actualizar cliente
        if (data.clientes) {
            const cliente = data.clientes.find(c => c.id === servicio.clienteId);
            if (cliente) {
                cliente.ultimaVisita = servicio.fecha;
                cliente.totalVisitas = (cliente.totalVisitas || 0) + 1;
                cliente.totalGastado = (cliente.totalGastado || 0) + servicio.precio;
            }
        }

        this.saveData(data);
        return servicio.id;
    }

    // VENTAS
    getVentas() { 
        const data = this.getData();
        return data.ventas || []; 
    }
    
    addVenta(venta) {
        const data = this.getData();
        venta.id = this.generateId();
        venta.fecha = venta.fecha || new Date().toISOString().split('T')[0];
        
        if (!data.ventas) {
            data.ventas = [];
        }
        
        data.ventas.push(venta);
        
        // Actualizar inventario
        if (data.inventario && venta.items) {
            venta.items.forEach(item => {
                const producto = data.inventario.find(p => p.id === item.productoId);
                if (producto) producto.stock -= item.cantidad;
            });
        }

        this.saveData(data);
        return venta.id;
    }

    // INVENTARIO
    getInventario() { 
        const data = this.getData();
        return data.inventario || []; 
    }
    
    addProducto(producto) {
        const data = this.getData();
        producto.id = this.generateId();
        
        if (!data.inventario) {
            data.inventario = [];
        }
        
        data.inventario.push(producto);
        this.saveData(data);
        return producto.id;
    }

    updateProducto(id, updates) {
        const data = this.getData();
        if (!data.inventario) return false;
        
        const index = data.inventario.findIndex(p => p.id === id);
        if (index !== -1) {
            data.inventario[index] = { ...data.inventario[index], ...updates };
            this.saveData(data);
            return true;
        }
        return false;
    }

    // CITAS
    getCitas() { 
        const data = this.getData();
        return data.citas || []; 
    }
    
    addCita(cita) {
        const data = this.getData();
        cita.id = this.generateId();
        cita.estado = "pendiente";
        
        if (!data.citas) {
            data.citas = [];
        }
        
        data.citas.push(cita);
        this.saveData(data);
        return cita.id;
    }

    // UTILIDADES
    generateId() { 
        return Date.now() + Math.floor(Math.random() * 1000); 
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(amount);
    }

    getClientesConRecordatorio() {
        const clientes = this.getClientes();
        const hoy = new Date();
        
        return clientes.filter(cliente => {
            if (!cliente.ultimaVisita) return false;
            const ultimaVisita = new Date(cliente.ultimaVisita);
            const diasDiferencia = Math.floor((hoy - ultimaVisita) / (1000 * 60 * 60 * 24));
            return diasDiferencia >= 15 && cliente.whatsapp;
        });
    }

    getGananciasHoy() {
        const hoy = new Date().toISOString().split('T')[0];
        const serviciosHoy = this.getServiciosRealizados().filter(s => s.fecha === hoy);
        const ventasHoy = this.getVentas().filter(v => v.fecha === hoy);
        
        return serviciosHoy.reduce((sum, s) => sum + s.precio, 0) + 
               ventasHoy.reduce((sum, v) => sum + v.total, 0);
    }

    // NUEVA FUNCIÓN: Obtener servicios por barbero
    getServiciosPorBarbero(barberoId = null, mes = null, año = null) {
        const servicios = this.getServiciosRealizados();
        const hoy = new Date();
        const mesActual = mes !== null ? mes : hoy.getMonth();
        const añoActual = año !== null ? año : hoy.getFullYear();
        
        let serviciosFiltrados = servicios.filter(servicio => {
            const fechaServicio = new Date(servicio.fecha);
            return fechaServicio.getMonth() === mesActual && 
                   fechaServicio.getFullYear() === añoActual;
        });
        
        if (barberoId) {
            serviciosFiltrados = serviciosFiltrados.filter(s => s.barberoId === barberoId);
        }
        
        return serviciosFiltrados;
    }
}

const dataManager = new DataManager();
