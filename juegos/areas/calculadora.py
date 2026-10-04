"""Calculadora de áreas de figuras planas, sin dependencias."""
import json
import math

MAX_VALUE = 10**12

CAMPOS = {
    "triangulo": ("base", "altura"),
    "rectangulo": ("base", "altura"),
    "cuadrado": ("lado",),
    "circulo": ("radio",),
    "trapecio": ("base_mayor", "base_menor", "altura"),
    "paralelogramo": ("base", "altura"),
    "rombo": ("diagonal_mayor", "diagonal_menor"),
}

def _numero(valor):
    try:
        n = float(str(valor).strip().replace(",", "."))
    except (ValueError, TypeError):
        raise ValueError("value") from None
    if not math.isfinite(n) or n <= 0 or n > MAX_VALUE:
        raise ValueError("value")
    return n

def calcular(figura, valores):
    if figura not in CAMPOS:
        raise ValueError("shape")

    campos = CAMPOS[figura]
    datos = {}
    for campo in campos:
        if campo not in valores:
            raise ValueError("value")
        datos[campo] = _numero(valores[campo])

    if figura == "triangulo":
        area = datos["base"] * datos["altura"] / 2
        formula = "A = (b × h) / 2"
    elif figura == "rectangulo":
        area = datos["base"] * datos["altura"]
        formula = "A = b × h"
    elif figura == "cuadrado":
        area = datos["lado"] ** 2
        formula = "A = l²"
    elif figura == "circulo":
        area = math.pi * datos["radio"] ** 2
        formula = "A = π × r²"
    elif figura == "trapecio":
        area = (datos["base_mayor"] + datos["base_menor"]) * datos["altura"] / 2
        formula = "A = ((B + b) × h) / 2"
    elif figura == "paralelogramo":
        area = datos["base"] * datos["altura"]
        formula = "A = b × h"
    else:
        area = datos["diagonal_mayor"] * datos["diagonal_menor"] / 2
        formula = "A = (D × d) / 2"

    return {
        "figura": figura,
        "area": area,
        "formula": formula,
        "valores": datos,
    }

def calcular_json(figura, valores_json):
    try:
        valores = json.loads(valores_json)
        return json.dumps(calcular(figura, valores), allow_nan=False, ensure_ascii=False)
    except (ValueError, TypeError, json.JSONDecodeError) as error:
        clave = str(error) if isinstance(error, ValueError) else "value"
        return json.dumps({"error": clave})

if __name__ == "__main__":
    print("Calculadora de áreas")
    print("Figuras:", ", ".join(CAMPOS))
    figura = input("Figura: ").strip().lower()
    if figura not in CAMPOS:
        print("Figura no válida")
    else:
        valores = {}
        for campo in CAMPOS[figura]:
            valores[campo] = input(f"{campo}: ")
        try:
            r = calcular(figura, valores)
            print(r["formula"])
            print(f"Área = {r['area']:.10g}")
        except ValueError:
            print("Medidas no válidas")
