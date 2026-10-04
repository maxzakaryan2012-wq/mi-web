"""Motor del Duelo de cálculo mental, sin dependencias externas."""
import json
import random

def nueva_operacion(dificultad):
    if dificultad not in ("facil", "medio", "dificil"):
        dificultad = "facil"

    if dificultad == "facil":
        op = random.choice(["+", "-"])
        a = random.randint(1, 50)
        b = random.randint(1, 50)
        if op == "-" and b > a:
            a, b = b, a
        resultado = a + b if op == "+" else a - b

    elif dificultad == "medio":
        op = random.choice(["+", "-", "×"])
        if op == "×":
            a = random.randint(2, 12)
            b = random.randint(2, 12)
            resultado = a * b
        else:
            a = random.randint(10, 150)
            b = random.randint(1, 100)
            if op == "-" and b > a:
                a, b = b, a
            resultado = a + b if op == "+" else a - b

    else:
        op = random.choice(["+", "-", "×", "÷"])
        if op == "×":
            a = random.randint(6, 25)
            b = random.randint(3, 15)
            resultado = a * b
        elif op == "÷":
            b = random.randint(2, 15)
            resultado = random.randint(2, 25)
            a = b * resultado
        else:
            a = random.randint(50, 500)
            b = random.randint(10, 300)
            if op == "-" and b > a:
                a, b = b, a
            resultado = a + b if op == "+" else a - b

    return {"a": a, "b": b, "operador": op, "resultado": resultado}

def nueva_json(dificultad):
    return json.dumps(nueva_operacion(dificultad), ensure_ascii=False)

def comprobar_json(correcta, respuesta):
    try:
        correcta = int(correcta)
        texto = str(respuesta).strip()
        if texto == "":
            raise ValueError
        usuario = int(texto)
    except (ValueError, TypeError):
        return json.dumps({"error": "invalid"})
    return json.dumps({"correcto": usuario == correcta, "respuesta": correcta})
