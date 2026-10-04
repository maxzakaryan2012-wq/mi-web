"""Juego de secuencias matemáticas, sin dependencias externas."""
import json
import random
import sys

def nueva_secuencia():
    tipo = random.choice(["aritmetica", "geometrica", "fibonacci", "alternante"])

    if tipo == "aritmetica":
        inicio = random.randint(-20, 30)
        paso = random.choice([i for i in range(-12, 13) if i != 0])
        seq = [inicio + paso * i for i in range(6)]
        explicacion = f"Cada número cambia en {paso:+d}."
    elif tipo == "geometrica":
        inicio = random.randint(1, 8)
        factor = random.choice([2, 3, 4])
        seq = [inicio * (factor ** i) for i in range(6)]
        explicacion = f"Cada número se multiplica por {factor}."
    elif tipo == "fibonacci":
        a = random.randint(1, 8)
        b = random.randint(2, 12)
        seq = [a, b]
        while len(seq) < 6:
            seq.append(seq[-1] + seq[-2])
        explicacion = "Cada número es la suma de los dos anteriores."
    else:
        inicio = random.randint(0, 15)
        suma = random.randint(2, 8)
        resta = random.randint(1, 5)
        seq = [inicio]
        for i in range(5):
            seq.append(seq[-1] + suma if i % 2 == 0 else seq[-1] - resta)
        explicacion = f"Alterna +{suma} y -{resta}."

    return {"visible": seq[:5], "respuesta": seq[5], "tipo": tipo, "explicacion": explicacion}

def nueva_json():
    return json.dumps(nueva_secuencia(), ensure_ascii=False)

def comprobar_json(respuesta_correcta, respuesta_usuario):
    try:
        correcta = int(respuesta_correcta)
        texto = str(respuesta_usuario).strip()
        if texto == "":
            raise ValueError
        usuario = int(texto)
    except (ValueError, TypeError):
        return json.dumps({"error": "invalid"})
    return json.dumps({"correcto": usuario == correcta, "respuesta": correcta})

if __name__ == "__main__" and sys.platform != "emscripten":
    juego = nueva_secuencia()
    print("Secuencia:", ", ".join(map(str, juego["visible"])), ", ?")
    try:
        respuesta = int(input("Siguiente número: "))
        print("Correcto" if respuesta == juego["respuesta"] else f"No. Era {juego['respuesta']}")
        print(juego["explicacion"])
    except ValueError:
        print("Respuesta no válida")
