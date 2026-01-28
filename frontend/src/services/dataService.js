import api from "./api";

export const serviceService = {
    // Get all services
    getAll: async () => {
        const response = await api.get("/services");
        return response.data;
    },

    // Create service (Admin/Staff)
    create: async (data) => {
        const formData = new FormData();
        Object.keys(data).forEach((key) => {
            // Skip image_url and imagePreview - they are not form fields
            if (key === "image_url" || key === "imagePreview") return;
            if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        });
        const response = await api.post("/services", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },

    // Update service (Admin/Staff)
    update: async (id, data) => {
        const formData = new FormData();
        Object.keys(data).forEach((key) => {
            // Skip image_url and imagePreview - they are not form fields
            if (key === "image_url" || key === "imagePreview") return;
            if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        });
        const response = await api.post(
            `/services/${id}?_method=PUT`,
            formData,
            {
                headers: { "Content-Type": "multipart/form-data" },
            },
        );
        return response.data;
    },

    // Delete service (Admin only)
    delete: async (id) => {
        const response = await api.delete(`/services/${id}`);
        return response.data;
    },
};

export const productService = {
    // Get all products
    getAll: async () => {
        const response = await api.get("/products");
        return response.data;
    },

    // Create product (Admin/Staff)
    create: async (data) => {
        const formData = new FormData();
        Object.keys(data).forEach((key) => {
            // Skip image_url and imagePreview - they are not form fields
            if (key === "image_url" || key === "imagePreview") return;
            if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        });
        const response = await api.post("/products", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },

    // Update product (Admin/Staff)
    update: async (id, data) => {
        const formData = new FormData();
        Object.keys(data).forEach((key) => {
            // Skip image_url and imagePreview - they are not form fields
            if (key === "image_url" || key === "imagePreview") return;
            if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        });
        const response = await api.post(
            `/products/${id}?_method=PUT`,
            formData,
            {
                headers: { "Content-Type": "multipart/form-data" },
            },
        );
        return response.data;
    },

    // Delete product (Admin only)
    delete: async (id) => {
        const response = await api.delete(`/products/${id}`);
        return response.data;
    },
    // Get available coupons
    getAvailableCoupons: async () => {
        const response = await api.get("/orders/coupons");
        return response.data;
    },

    // Validate coupon
    validateCoupon: async (data) => {
        const response = await api.post("/orders/validate-coupon", data);
        return response.data;
    },
};

export const appointmentService = {
    // Book appointment
    book: async (data) => {
        const response = await api.post("/booking", data);
        return response.data;
    },

    // Get my appointments (Client)
    getMyAppointments: async () => {
        const response = await api.get("/my-appointments");
        return response.data;
    },

    // Get all appointments (Staff/Admin)
    getAll: async () => {
        const response = await api.get("/appointments");
        return response.data;
    },

    // Cancel appointment
    cancel: async (id) => {
        const response = await api.post(`/appointments/${id}/cancel`);
        return response.data;
    },

    // Update appointment
    update: async (id, data) => {
        const response = await api.put(`/appointments/${id}`, data);
        return response.data;
    },

    // Update status (Staff/Admin)
    updateStatus: async (id, status) => {
        const response = await api.put(`/appointments/${id}/status`, {
            status,
        });
        return response.data;
    },

    // Check availability
    checkAvailability: async (data) => {
        const response = await api.post("/appointments/check", data);
        return response.data;
    },
};

export const customerService = {
    // Get customer statistics (Admin only)
    getStatistics: async () => {
        const response = await api.get("/customers/statistics");
        return response.data;
    },

    // Get top spenders (Admin only)
    getTopSpenders: async (limit = 10) => {
        const response = await api.get(
            `/customers/top-spenders?limit=${limit}`,
        );
        return response.data;
    },
};

export const staffService = {
    // Get staff statistics (Admin only - all staff stats)
    getStatistics: async () => {
        const response = await api.get("/staff/statistics");
        return response.data;
    },

    // Get my statistics (Staff only - own stats)
    getMyStatistics: async () => {
        const response = await api.get("/staff/my-statistics");
        return response.data;
    },

    // Get staff performance (Admin only)
    getPerformance: async (from, to) => {
        const response = await api.get("/staff/performance", {
            params: { from, to },
        });
        return response.data;
    },
};

export const contactService = {
    // Submit contact message (Public - no auth required)
    submit: async (data) => {
        const response = await api.post("/contact", data);
        return response.data;
    },

    // Get all contact messages (Admin/Staff)
    getAll: async (status = null) => {
        const params = status ? { status } : {};
        const response = await api.get("/contacts", { params });
        return response.data;
    },

    // Get single contact message (Admin/Staff)
    getById: async (id) => {
        const response = await api.get(`/contacts/${id}`);
        return response.data;
    },

    // Reply to contact message (Admin/Staff)
    reply: async (id, replyMessage) => {
        const response = await api.post(`/contacts/${id}/reply`, {
            admin_reply: replyMessage,
        });
        return response.data;
    },

    // Update contact status (Admin/Staff)
    updateStatus: async (id, status) => {
        const response = await api.put(`/contacts/${id}/status`, { status });
        return response.data;
    },

    // Delete contact message (Admin only)
    delete: async (id) => {
        const response = await api.delete(`/contacts/${id}`);
        return response.data;
    },

    // Get contact statistics (Admin only)
    getStatistics: async () => {
        const response = await api.get("/contacts/statistics");
        return response.data;
    },
};

export const orderService = {
    // Get all orders (Admin/Staff get all, Client gets own)
    getAll: async () => {
        const response = await api.get("/orders");
        return response.data;
    },

    // Get single order
    getById: async (id) => {
        const response = await api.get(`/orders/${id}`);
        return response.data;
    },

    // Create order
    create: async (orderData) => {
        const response = await api.post("/orders", orderData);
        return response.data;
    },

    // Update order status (Admin/Staff)
    updateStatus: async (id, status) => {
        const response = await api.put(`/orders/${id}/status`, { status });
        return response.data;
    },

    // Cancel order
    cancel: async (id) => {
        const response = await api.post(`/orders/${id}/cancel`);
        return response.data;
    },

    // Process payment
    processPayment: async (id, paymentMethod) => {
        const response = await api.post(`/orders/${id}/payment`, {
            payment_method: paymentMethod,
        });
        return response.data;
    },

    // Delete order (Admin only)
    delete: async (id) => {
        const response = await api.delete(`/orders/${id}`);
        return response.data;
    },

    // Get available coupons
    getAvailableCoupons: async () => {
        const response = await api.get("/orders/coupons");
        return response.data;
    },

    // Validate coupon
    validateCoupon: async (data) => {
        const response = await api.post("/orders/validate-coupon", data);
        return response.data;
    },
};

export const blogService = {
    // Get all blogs (Admin - including drafts)
    getAll: async () => {
        const response = await api.get("/blogs/all");
        return response.data;
    },

    // Get published blogs (Public)
    getPublished: async () => {
        const response = await api.get("/blogs");
        return response.data;
    },

    // Create blog
    create: async (blogData) => {
        const formData = new FormData();
        Object.keys(blogData).forEach((key) => {
            // Skip image_url and imagePreview - they are not form fields
            if (key === "image_url" || key === "imagePreview") return;
            if (blogData[key] !== null && blogData[key] !== undefined) {
                formData.append(key, blogData[key]);
            }
        });
        const response = await api.post("/blogs", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },

    // Update blog
    update: async (id, blogData) => {
        const formData = new FormData();
        Object.keys(blogData).forEach((key) => {
            // Skip image_url and imagePreview - they are not form fields
            if (key === "image_url" || key === "imagePreview") return;
            if (blogData[key] !== null && blogData[key] !== undefined) {
                formData.append(key, blogData[key]);
            }
        });
        const response = await api.post(`/blogs/${id}?_method=PUT`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },

    // Delete blog
    delete: async (id) => {
        const response = await api.delete(`/blogs/${id}`);
        return response.data;
    },
};

export const feedbackService = {
    // Get all feedbacks
    getAll: async () => {
        const response = await api.get("/feedbacks");
        return response.data;
    },

    // Create feedback
    create: async (data) => {
        const response = await api.post("/feedbacks", data);
        return response.data;
    },

    // Get feedback by appointment
    getByAppointment: async (appointmentId) => {
        const response = await api.get(
            `/feedbacks/appointment/${appointmentId}`,
        );
        return response.data;
    },
};

export const settingsService = {
    // Get all salon settings (Admin only)
    getSettings: async () => {
        const response = await api.get("/capacity/settings");
        return response.data;
    },

    // Update salon settings (Admin only)
    updateSettings: async (settings) => {
        const response = await api.put("/capacity/settings", { settings });
        return response.data;
    },

    // Get capacity dashboard
    getCapacityDashboard: async (date = null) => {
        const params = date ? { date } : {};
        const response = await api.get("/capacity/dashboard", { params });
        return response.data;
    },
};
