import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Registro() {
  // 1. ESTADOS PARA LOS CAMPOS (Basados en tu imagen de BD)
  const [nombre, setNombre] = useState("");
  const [apellidoP, setApellidoP] = useState("");
  const [apellidoM, setApellidoM] = useState("");
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [rol, setRol] = useState("Cuidador");
  const [idCuidador, setIdCuidador] = useState("");

  // ESTADOS PARA EL DATE PICKER
  const [fecha, setFecha] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [fechaTexto, setFechaTexto] = useState("Seleccionar fecha");

  // 2. MANEJADOR DE FECHA
  const onChangeFecha = (event: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === "ios");
    if (selectedDate) {
      setFecha(selectedDate);
      // Formato visual para el usuario
      const opciones: Intl.DateTimeFormatOptions = {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      };
      setFechaTexto(selectedDate.toLocaleDateString("es-ES", opciones));
    }
  };

  // 3. LÓGICA DE REGISTRO
  const registrarUsuario = async () => {
    if (
      !nombre ||
      !apellidoP ||
      !correo ||
      !contraseña ||
      fechaTexto === "Seleccionar fecha"
    ) {
      Alert.alert("Error", "Por favor llena todos los campos obligatorios.");
      return;
    }

    // Formateamos la fecha a YYYY-MM-DD para la base de datos
    const fechaSQL = fecha.toISOString().split("T")[0];

    const datosRegistro = {
      nombre,
      apellidoP,
      apellidoM,
      correo,
      contraseña,
      fecha_nacimiento: fechaSQL,
      rol,
      id_cuidador_vinculado: rol === "Persona Mayor" ? idCuidador : null,
    };

    try {
      // ⚠️ Cambia la IP por la de tu servidor local
      const urlDelServidor = "http://192.168.100.38:4000/auth/signup";
      const respuesta = await fetch(urlDelServidor, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosRegistro),
      });

      if (respuesta.ok) {
        Alert.alert("Éxito", "Cuenta creada con éxito.");
        router.replace("/inicio");
      } else {
        const error = await respuesta.json();
        Alert.alert("Error", error.mensaje || "Hubo un problema al registrar.");
      }
    } catch (error) {
      Alert.alert("Error de conexión", "No se pudo conectar con el servidor.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.mainContainer}>
      <Text style={styles.header}>OldFit</Text>
      <Text style={styles.subHeader}>Registro de nuevo usuario</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Nombre:</Text>
        <TextInput
          style={styles.input}
          value={nombre}
          onChangeText={setNombre}
          placeholder="Nombre(s)"
        />

        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Apellido Paterno:</Text>
            <TextInput
              style={styles.input}
              value={apellidoP}
              onChangeText={setApellidoP}
            />
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Apellido Materno:</Text>
            <TextInput
              style={styles.input}
              value={apellidoM}
              onChangeText={setApellidoM}
            />
          </View>
        </View>

        <Text style={styles.label}>Correo Electrónico:</Text>
        <TextInput
          style={styles.input}
          value={correo}
          onChangeText={setCorreo}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Contraseña:</Text>
        <TextInput
          style={styles.input}
          value={contraseña}
          onChangeText={setContraseña}
          secureTextEntry
        />

        {/* SELECTOR DE FECHA */}
        <Text style={styles.label}>Fecha de Nacimiento:</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowPicker(true)}
        >
          <Text
            style={{
              color: fechaTexto === "Seleccionar fecha" ? "#999" : "#000",
            }}
          >
            {fechaTexto}
          </Text>
        </TouchableOpacity>

        {showPicker && (
          <DateTimePicker
            value={fecha}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            maximumDate={new Date()} // No permite fechas futuras
            onChange={onChangeFecha}
          />
        )}

        {/* SELECTOR DE ROL */}
        <Text style={styles.label}>¿Quién eres?:</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={rol}
            onValueChange={(val) => setRol(val)}
            style={styles.picker}
          >
            <Picker.Item label="Cuidador" value="cuidador" />
            <Picker.Item label="Persona Mayor" value="Persona Mayor" />
          </Picker>
        </View>

        {/* CAMPO CONDICIONAL */}
        {rol === "Persona Mayor" && (
          <View style={styles.vinculoContainer}>
            <Text style={styles.label}>ID de tu Cuidador (Vincular):</Text>
            <TextInput
              style={[styles.input, { borderColor: "#3498db", borderWidth: 2 }]}
              placeholder="Ej: 123"
              value={idCuidador}
              onChangeText={setIdCuidador}
              keyboardType="numeric"
            />
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.button} onPress={registrarUsuario}>
        <Text style={styles.buttonText}>Crear Cuenta</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
        <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flexGrow: 1,
    backgroundColor: "#d0eafdff", // Mismo color que inicio.tsx
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50",
    textAlign: "center",
  },
  subHeader: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
    marginBottom: 25,
  },
  inputContainer: {
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 5,
    color: "#34495e",
  },
  input: {
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#dcdde1",
    marginBottom: 12,
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  column: {
    width: "48%",
  },
  pickerWrapper: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#dcdde1",
    marginBottom: 12,
    overflow: "hidden",
  },
  picker: {
    height: 50,
    width: "100%",
  },
  vinculoContainer: {
    marginTop: 5,
    padding: 10,
    backgroundColor: "#e3f2fd",
    borderRadius: 8,
  },
  button: {
    backgroundColor: "#3498db", // Azul de inicio.tsx
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  linkText: {
    textAlign: "center",
    color: "#34495e",
    fontWeight: "500",
  },
});
