document.addEventListener("DOMContentLoaded", () => {
    // IMPORTANTE: Insira seu número real com código do país e DDD
    const WHATSAPP_NUMBER = "5511963692499"; 

    const serviceCards = document.querySelectorAll(".add-to-cart-btn");
    const quoteModal = document.getElementById("quote-modal");
    const closeModalBtn = document.getElementById("close-modal-btn");
    const sendWhatsappBtn = document.getElementById("send-whatsapp-btn");
    const selectedServiceTitle = document.getElementById("selected-service-title");

    let currentSelectedService = "";

    // 1. Abrir modal ao clicar no card do serviço
    serviceCards.forEach(card => {
        card.addEventListener("click", (e) => {
            currentSelectedService = e.currentTarget.getAttribute("data-name");
            selectedServiceTitle.textContent = `Orçamento: ${currentSelectedService}`;
            
            // Reseta os contadores e formulários toda vez que abrir o modal
            resetForm();
            
            quoteModal.classList.remove("hidden");
        });
    });

    // 2. Fechar modal (Botão ou clicando fora)
    closeModalBtn.addEventListener("click", () => quoteModal.classList.add("hidden"));
    
    quoteModal.addEventListener("click", (e) => {
        if (e.target === quoteModal) {
            quoteModal.classList.add("hidden");
        }
    });

    // 3. Lógica dos Contadores de Inventário (+ e -)
    const counterBtns = document.querySelectorAll(".counter-btn");
    
    counterBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            const action = e.target.getAttribute("data-action");
            const targetId = e.target.getAttribute("data-target");
            const countElement = document.getElementById(targetId);
            let currentCount = parseInt(countElement.textContent);

            if (action === "plus") {
                currentCount++;
            } else if (action === "minus" && currentCount > 0) {
                currentCount--;
            }

            countElement.textContent = currentCount;
        });
    });

    // 4. Enviar para WhatsApp
    sendWhatsappBtn.addEventListener("click", () => {
        const origin = document.getElementById("origin").value.trim();
        const destination = document.getElementById("destination").value.trim();
        const accessType = document.getElementById("access-type").value;
        const helpers = document.getElementById("helpers").value;
        const assembly = document.getElementById("assembly").value;
        const extraItems = document.getElementById("extra-items").value.trim();

        // Validação
        if (!origin || !destination) {
            Toastify({
                text: "⚠️ Preencha a Retirada e a Entrega!",
                duration: 3000,
                close: true,
                gravity: "top",
                position: "center",
                style: { background: "#ff4d4d" }
            }).showToast();
            return;
        }

        if (!accessType) {
            Toastify({
                text: "⚠️ Informe o tipo de acesso (Escadas/Elevador).",
                duration: 3000,
                close: true,
                gravity: "top",
                position: "center",
                style: { background: "#ff4d4d" }
            }).showToast();
            return;
        }

        // Mapeamento dos itens para o texto final
        let inventoryText = "";
        const items = [
            { id: "item-geladeira", label: "Geladeira(s)" },
            { id: "item-eletro", label: "Fogão/Máquina de Lavar" },
            { id: "item-sofa", label: "Sofá(s)" },
            { id: "item-moveis-sala", label: "Rack/Painel/Mesa" },
            { id: "item-cama", label: "Cama(s)/Colchão" },
            { id: "item-armario", label: "Guarda-Roupa(s)" },
            { id: "item-caixas", label: "Caixas/Sacos (Aprox.)" }
        ];

        items.forEach(item => {
            const count = parseInt(document.getElementById(item.id).textContent);
            if (count > 0) {
                inventoryText += `🔹 ${count}x ${item.label}\n`;
            }
        });

        // Montagem da Mensagem
        let message = `*NOVO PEDIDO DE ORÇAMENTO* 🚚\n\n`;
        message += `*Serviço:* ${currentSelectedService}\n`;
        message += `📍 *Retirada:* ${origin}\n`;
        message += `🏁 *Entrega:* ${destination}\n`;
        message += `🏢 *Acesso/Imóvel:* ${accessType}\n\n`;
        
        message += `*SERVIÇOS EXTRAS:*\n`;
        message += `👷 ${helpers}\n`;
        message += `🛠️ ${assembly}\n\n`;

        message += `*INVENTÁRIO PRINCIPAL:*\n`;
        if (inventoryText === "" && !extraItems) {
            message += `_Apenas itens miúdos ou não informados._\n`;
        } else {
            message += inventoryText;
            if (extraItems) message += `\n*Outros/Avisos:* ${extraItems}\n`;
        }

        // Direcionamento URL
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

        window.open(whatsappUrl, "_blank");
        quoteModal.classList.add("hidden");
    });

    // 5. Função auxiliar para resetar formulário
    function resetForm() {
        document.querySelectorAll("input[type='text']").forEach(input => input.value = "");
        document.getElementById("access-type").value = "";
        document.getElementById("helpers").value = "Somente o Motorista";
        document.getElementById("assembly").value = "Sem montagem";
        document.querySelectorAll(".item-count").forEach(span => span.textContent = "0");
    }

    // 6. Atualização de Horário (Badge Visual)
    const updateStatusBadge = () => {
        const badge = document.getElementById("status-badge");
        const statusText = document.getElementById("status-text");
        const now = new Date();
        const hour = now.getHours();

        // Configurado das 08:00 às 18:00 (Ajuste se necessário)
        if (hour >= 8 && hour < 18) {
            badge.classList.add("bg-green-500", "shadow-[0_0_15px_rgba(34,197,94,0.5)]");
            badge.classList.remove("bg-red-500", "shadow-[0_0_15px_rgba(239,68,68,0.5)]");
            statusText.textContent = "🟢 Aberto Agora";
        } else {
            badge.classList.add("bg-red-500", "shadow-[0_0_15px_rgba(239,68,68,0.5)]");
            badge.classList.remove("bg-green-500", "shadow-[0_0_15px_rgba(34,197,94,0.5)]");
            statusText.textContent = "🔴 Fechado (Envie msg e aguarde)";
        }
    };

    updateStatusBadge();
});
