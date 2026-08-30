import dataclasses
from typing import Any, TypeVar

T = TypeVar("T")


def row_to_domain(domain_cls: type[T], row: Any) -> T:
    """Mapeia um model ORM pra uma dataclass de domínio pegando os campos com o
    mesmo nome via getattr. Só serve pra domínios "espelho" (mesmo nome de campo
    dos dois lados, sem relationship pra converter) — Customer (endereço
    aninhado) e Transaction (items aninhados) continuam com mapeamento manual
    porque têm estrutura de verdade pra montar, não é só copiar valor por valor.

    Troca segurança de tipo em tempo de checagem (mypy não valida os nomes de
    campo aqui) por menos duplicação — um typo num nome de campo só aparece em
    runtime, não mais no mypy. Vale a pena só pros casos de espelho 1:1 como este."""
    field_names = [f.name for f in dataclasses.fields(domain_cls)]  # type: ignore[arg-type]
    values = {name: getattr(row, name) for name in field_names}
    return domain_cls(**values)
