import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Customer } from '../../types';
import { AddressSection } from './AddressSection';

function makeCustomer(overrides: Partial<Customer['address']> = {}): Customer {
  return {
    id: '7742',
    name: 'João Silva',
    documentType: 'cpf',
    document: '12345678900',
    email: 'joao@example.com',
    phone: '47999990000',
    address: {
      cep: '89200000',
      street: 'Rua das Flores',
      number: '100',
      neighborhood: 'Centro',
      city: 'Joinville',
      state: 'SC',
      ...overrides,
    },
    balance: 0,
    lastUpdated: '2026-01-01T00:00:00Z',
    active: true,
    stats: { totalEarned: 0, totalRedeemed: 0, memberSince: '2026-01-01T00:00:00Z' },
  };
}

describe('AddressSection — modo leitura', () => {
  it('mostra os valores do endereço do cliente', () => {
    const customer = makeCustomer();

    render(<AddressSection customer={customer} editedCustomer={customer} isEditing={false} onChange={vi.fn()} />);

    expect(screen.getByText('89200000')).toBeInTheDocument();
    expect(screen.getByText('Rua das Flores')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('Centro')).toBeInTheDocument();
    expect(screen.getByText('Joinville')).toBeInTheDocument();
    expect(screen.getByText('SC')).toBeInTheDocument();
  });

  it('mostra "Não informado" quando o complemento está vazio', () => {
    const customer = makeCustomer({ complement: undefined });

    render(<AddressSection customer={customer} editedCustomer={customer} isEditing={false} onChange={vi.fn()} />);

    expect(screen.getByText('Não informado')).toBeInTheDocument();
  });

  it('mostra o complemento quando presente', () => {
    const customer = makeCustomer({ complement: 'Apto 201' });

    render(<AddressSection customer={customer} editedCustomer={customer} isEditing={false} onChange={vi.fn()} />);

    expect(screen.getByText('Apto 201')).toBeInTheDocument();
  });

  it('não renderiza nenhum input em modo leitura', () => {
    const customer = makeCustomer();

    render(<AddressSection customer={customer} editedCustomer={customer} isEditing={false} onChange={vi.fn()} />);

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });
});

describe('AddressSection — modo edição', () => {
  it('renderiza os campos com o valor atual de editedCustomer (não o de customer)', () => {
    const customer = makeCustomer({ street: 'Rua Antiga' });
    const editedCustomer = makeCustomer({ street: 'Rua Nova' });

    render(
      <AddressSection customer={customer} editedCustomer={editedCustomer} isEditing={true} onChange={vi.fn()} />,
    );

    expect(screen.getByDisplayValue('Rua Nova')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('Rua Antiga')).not.toBeInTheDocument();
  });

  it('chama onChange com o campo editado ao digitar na Rua', () => {
    // Input controlado: o valor vem de editedCustomer via prop e não é atualizado
    // pelo mock de onChange, então simulamos um único evento de troca (como o
    // handler realmente recebe cada keystroke) em vez de userEvent.type, que
    // exigiria um wrapper com estado próprio pra não perder o que foi digitado.
    const customer = makeCustomer();
    const onChange = vi.fn();

    render(<AddressSection customer={customer} editedCustomer={customer} isEditing={true} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Rua'), { target: { value: 'Rua Nova' } });

    expect(onChange).toHaveBeenCalledWith({ street: 'Rua Nova' });
  });

  it('CEP remove caracteres não numéricos antes de propagar', () => {
    // Valor curto de propósito: o input tem maxLength=8, então um valor mais
    // longo seria truncado pelo próprio DOM antes do onChange, misturando dois
    // comportamentos (maxLength + strip de não-dígito) no mesmo teste.
    const customer = makeCustomer();
    const onChange = vi.fn();

    render(<AddressSection customer={customer} editedCustomer={customer} isEditing={true} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('CEP'), { target: { value: '8a9' } });

    expect(onChange).toHaveBeenCalledWith({ cep: '89' });
  });

  it('Número remove caracteres não numéricos antes de propagar', () => {
    const customer = makeCustomer();
    const onChange = vi.fn();

    render(<AddressSection customer={customer} editedCustomer={customer} isEditing={true} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Número'), { target: { value: '1b00' } });

    expect(onChange).toHaveBeenCalledWith({ number: '100' });
  });

  it('troca o estado (UF) via select e propaga a sigla escolhida', async () => {
    const customer = makeCustomer({ state: 'SC' });
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<AddressSection customer={customer} editedCustomer={customer} isEditing={true} onChange={onChange} />);
    await user.selectOptions(screen.getByLabelText('UF'), 'RJ');

    expect(onChange).toHaveBeenCalledWith({ state: 'RJ' });
  });

  it('campo de complemento vazio some para string vazia, não "Não informado"', () => {
    const customer = makeCustomer({ complement: undefined });

    render(<AddressSection customer={customer} editedCustomer={customer} isEditing={true} onChange={vi.fn()} />);

    expect(screen.getByPlaceholderText('Apto, Bloco, etc.')).toHaveValue('');
  });
});
