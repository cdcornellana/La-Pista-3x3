// ================================
// 3x3 LA PISTA - SUPABASE
// ================================

const SUPABASE_URL = "https://eoqpxunnqyojpbxzrgoi.supabase.co";

const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvcXB4dW5ucXlvanBieHpyZ29pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMDcxMjksImV4cCI6MjA5OTU4MzEyOX0.9iYNmeVnwFPbsOleoENpNdf_Bh-vpJ74PJe8yIzPOOc";

const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

// Referencias
const modal = document.getElementById("modal");
const formulario = document.getElementById("formulario");
const titulo = document.getElementById("tituloFormulario");

// ================================
// Abrir formulario
// ================================

function abrirFormulario(categoria) {

    document.getElementById("categoria").value = categoria;
    titulo.innerHTML = "Inscripción " + categoria;
    modal.style.display = "flex";

}

// ================================
// Cerrar formulario
// ================================

function cerrarFormulario() {

    modal.style.display = "none";
    formulario.reset();

}

window.onclick = function (e) {

    if (e.target === modal) {

        cerrarFormulario();

    }

};

formulario.addEventListener("submit", async function (e) {

    e.preventDefault();

    const boton = formulario.querySelector("button");

    boton.disabled = true;
    boton.innerHTML = "Enviando...";

    const categoria = document.getElementById("categoria").value;

    const nombre = document.getElementById("nombre").value.trim();

    const apellidos = document.getElementById("apellidos").value.trim();

    const edad = parseInt(document.getElementById("edad").value);

    const telefono = document.getElementById("telefono").value.trim();

    try {

        // Contar confirmados

        const { data: inscritos } = await supabase

            .from("inscripciones")

            .select("*")

            .eq("categoria", categoria)

            .eq("estado", "Confirmado");

        const limite = categoria === "Infantil" ? 45 : 24;

        const estado = inscritos.length < limite ? "Confirmado" : "Reserva";

        // Calcular número

        const { data: todos } = await supabase

            .from("inscripciones")

            .select("orden")

            .order("orden", { ascending: false })

            .limit(1);

        const orden = todos.length ? todos[0].orden + 1 : 1;

        const { error } = await supabase

            .from("inscripciones")

            .insert({

                estado,

                categoria,

                nombre,

                apellidos,

                edad,

                telefono,

                orden

            });

        if (error) throw error;

        if (estado === "Confirmado") {

            alert(
                "✅ Inscripción realizada correctamente.\n\nNº " + orden
            );

        } else {

            alert(
                "🟡 Categoría completa.\n\nHas quedado en LISTA DE RESERVA."
            );

        }

        formulario.reset();

        cerrarFormulario();

        cargarPlazas();

    } catch (err) {

        console.error(err);

        alert("Error al guardar la inscripción.");

    }

    boton.disabled = false;

    boton.innerHTML = "Enviar inscripción";

});

async function cargarPlazas() {

    const { data, error } = await supabase
        .from("inscripciones")
        .select("categoria,estado");

    if (error) {

        console.error(error);
        return;

    }

    let infantil = 0;
    let adulto = 0;

    data.forEach(i => {

        if (i.estado === "Confirmado") {

            if (i.categoria === "Infantil") infantil++;

            if (i.categoria === "Adulto") adulto++;

        }

    });

    document.getElementById("plazasInfantil").textContent = 48 - (infantil + 3);
    document.getElementById("plazasAdulto").textContent = 24 - adulto;

}

cargarPlazas();