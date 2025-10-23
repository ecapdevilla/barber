// data-manager.js
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
                    businessName: "Mi Barbería"
                },
                servicios: [
                    { id: 1, nombre: "Corte", precio: 15000, duracion: 30, activo: true, tipo: "servicio" },
                    { id: 2, nombre: "Corte y Barba", precio: 20000, duracion: 45, activo: true, tipo: "servicio" },
                    { id: 3, nombre: "Barba", precio: 8000, duracion: 20, activo: true, tipo: "servicio" }
                ],
                clientes: [],
                inventario: [],
                serviciosRealizados: [],
                ventas: [],
                citas: [],
                ganancias: {
                    diarias: [],
                    mensuales: [],
                    anuales: []
                }
            };
            this.saveData(initialData);
        }
    }

    getData() {
        return JSON.parse(localStorage.getItem('barberApp')) || {};
    }

    saveData(data) {
        localStorage.setItem('barberApp', JSON.stringify(data));
    }

    // CLIENTES
    addCliente(cliente) {
        const data = this.getData();
        cliente.id = this.generateId();
        cliente.fechaRegistro = new Date().toISOString().split('T')[0];
        cliente.totalVisitas = 0;
        cliente.totalGastado = 0;
        data.clientes.push(cliente);
        this.saveData(data);
        return cliente.id;
    }

    getClientes() {
        return this.getData().clientes || [];
    }

    updateCliente(id, updates) {
        const data = this.getData();
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
        return this.getData().servicios || [];
    }

    addServicio(servicio) {
        const data = this.getData();
        servicio.id = this.generateId();
        servicio.activo = true;
        data.servicios.push(servicio);
        this.saveData(data);
        return servicio.id;
    }

    updateServicio(id, updates) {
        const data = this.getData();
        const index = data.servicios.findIndex(s => s.id === id);
        if (index !== -1) {
            data.servicios[index] = { ...data.servicios[index], ...updates };
            this.saveData(data);
            return true;
        }
        return false;
    }

    // SERVICIOS REALIZADOS
    addServicioRealizado(servicio) {
        const data = this.getData();
        servicio.id = this.generateId();
        servicio.fecha = new Date().toISOString().split('T')[0];
        servicio.estado = "completado";
        
        data.serviciosRealizados.push(servicio);
        
        // Actualizar cliente
        const cliente = data.clientes.find(c => c.id === servicio.clienteId);
        if (cliente) {
            cliente.ultimaVisita = servicio.fecha;
            cliente.totalVisitas = (cliente.totalVisitas || 0) + 1;
            cliente.totalGastado = (cliente.totalGastado || 0) + servicio.precio;
        }

        this.saveData(data);
        return servicio.id;
    }

    getServiciosRealizados() {
        return this.getData().serviciosRealizados || [];
    }

    // VENTAS
    addVenta(venta) {
        const data = this.getData();
        venta.id = this.generateId();
        venta.fecha = new Date().toISOString().split('T')[0];
        
        data.ventas.push(venta);
        
        // Actualizar inventario
        venta.items.forEach(item => {
            const producto = data.inventario.find(p => p.id === item.productoId);
            if (producto) {
                producto.stock -= item.cantidad;
            }
        });

        // Actualizar cliente si existe
        if (venta.clienteId) {
            const cliente = data.clientes.find(c => c.id === venta.clienteId);
            if (cliente) {
                cliente.totalGastado = (cliente.totalGastado || 0) + venta.total;
                if (!cliente.ultimaVisita) cliente.ultimaVisita = venta.fecha;
            }
        }

        this.saveData(data);
        return venta.id;
    }

    // INVENTARIO
    addProducto(producto) {
        const data = this.getData();
        producto.id = this.generateId();
        data.inventario.push(producto);
        this.saveData(data);
        return producto.id;
    }

    getInventario() {
        return this.getData().inventario || [];
    }

    // CITAS
    addCita(cita) {
        const data = this.getData();
        cita.id = this.generateId();
        cita.estado = "pendiente";
        data.citas.push(cita);
        this.saveData(data);
        return cita.id;
    }

    getCitas() {
        return this.getData().citas || [];
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
        const servicios = this.getServiciosRealizados();
        const hoy = new Date();
        
        return clientes.filter(cliente => {
            if (!cliente.ultimaVisita) return false;
            
            const ultimaVisita = new Date(cliente.ultimaVisita);
            const diasDiferencia = Math.floor((hoy - ultimaVisita) / (1000 * 60 * 60 * 24));
            
            return diasDiferencia >= 15 && cliente.whatsapp;
        });
    }

    getProductosBajoStock() {
        return this.getInventario().filter(producto => 
            producto.stock <= producto.stockMinimo
        );
    }

    getGananciasHoy() {
        const hoy = new Date().toISOString().split('T')[0];
        const serviciosHoy = this.getServiciosRealizados().filter(s => s.fecha === hoy);
        const ventasHoy = this.getVentas().filter(v => v.fecha === hoy);
        
        const totalServicios = serviciosHoy.reduce((sum, s) => sum + s.precio, 0);
        const totalVentas = ventasHoy.reduce((sum, v) => sum + v.total, 0);
        
        return totalServicios + totalVentas;
    }

    getVentas() {
        return this.getData().ventas || [];
    }
}

// Instancia global
const dataManager = new DataManager();