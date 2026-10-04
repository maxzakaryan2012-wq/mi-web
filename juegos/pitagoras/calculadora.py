"""Cálculo de un lado de un triángulo rectángulo; sin dependencias."""
import json
import math
import sys


def calcular(lado, primero, segundo):
    if lado not in ('a', 'b', 'c'):
        raise ValueError('side')
    try:
        x, y = (float(str(v).strip().replace(',', '.')) for v in (primero, segundo))
    except (ValueError, TypeError):
        raise ValueError('positive') from None
    if not all(math.isfinite(v) and 0 < v <= 1e12 for v in (x, y)):
        raise ValueError('positive')
    if lado == 'c':
        resultado = math.hypot(x, y)
        cuadrado = x*x + y*y
    else:
        # El primer dato es siempre la hipotenusa al buscar un cateto.
        if x <= y:
            raise ValueError('hypotenuse')
        resultado = math.sqrt(x-y) * math.sqrt(x+y)
        cuadrado = (x-y)*(x+y)
    if resultado == 0:
        raise ValueError('positive')
    return {'lado': lado, 'x': x, 'y': y, 'resultado': resultado, 'cuadrado': cuadrado}


def calcular_json(lado, primero, segundo):
    try:
        return json.dumps(calcular(lado, primero, segundo), allow_nan=False)
    except ValueError as error:
        return json.dumps({'error': str(error)})


if __name__ == '__main__' and sys.platform != 'emscripten':
    lado = input('Lado que falta (a, b o c; c es la hipotenusa): ').strip().lower()
    print('Introduce los dos catetos.' if lado == 'c' else 'Introduce primero la hipotenusa y después el cateto conocido.')
    try:
        datos = calcular(lado, input('Primera medida: '), input('Segunda medida: '))
        print(f"{lado} = {datos['resultado']:.10g}")
    except ValueError as error:
        print('Datos inválidos:', error)
