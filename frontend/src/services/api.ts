export interface Usuario {
  id: string;
  nome: string;
  email: string;
  bio?: string;
  localizacao?: string;
  avatarUrl?: string;
  ativo: boolean;
  interesses: string[];
  criadoEm: string;
}

export type StatusServico = 'DISPONIVEL' | 'INDISPONIVEL';

export interface Servico {
  id: string;
  proprietarioId: string;
  proprietarioNome: string;
  proprietarioEmail: string;
  proprietarioAvatarUrl?: string;
  proprietarioLocalizacao?: string;
  titulo: string;
  tipo: string;
  categoria: string;
  descricao: string;
  status: StatusServico;
  criadoEm: string;
}

export interface MatchExplicado {
  parceiroId: string;
  parceiroNome: string;
  parceiroEmail: string;
  parceiroAvatarUrl?: string;
  parceiroBio?: string;
  parceiroLocalizacao?: string;
  meuServicoId: string;
  meuServicoTitulo: string;
  meuServicoTipo: string;
  servicoParceiroId: string;
  servicoParceiroTitulo: string;
  servicoParceiroTipo: string;
  motivoMatch: string;
  scoreCompatibilidade: number;
  propostaEmAndamento: boolean;
}

export type StatusProposta = 'PENDENTE' | 'ACEITA' | 'REJEITADA' | 'EXPIRADA';

export interface CondicaoContrato {
  id: string;
  descricao: string;
  obrigatoria: boolean;
  atendida: boolean;
}

export interface HistoricoProposta {
  id: string;
  status: StatusProposta;
  observacao: string;
  ocorridoEm: string;
}

export interface Proposta {
  id: string;
  solicitante: Usuario;
  destinatario: Usuario;
  servicoOferecido: Servico;
  servicoSolicitado: Servico;
  status: StatusProposta;
  mensagem?: string;
  criadaEm: string;
  expiraEm: string;
  condicoes: CondicaoContrato[];
  historico: HistoricoProposta[];
  contratoId?: string;
  podeAceitar: boolean;
  podeRejeitar: boolean;
  podeCancelar: boolean;
  podeGerarContrato: boolean;
}

export interface Contrato {
  id: string;
  propostaId: string;
  proposta: Proposta;
  geradoEm: string;
  conteudo: string;
  hashIntegridade: string;
  integro: boolean;
}

export interface VerificacaoIntegridade {
  contratoId: string;
  hashRegistrado: string;
  hashCalculado: string;
  integro: boolean;
  mensagemExplicativa: string;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

// Token helper
const TOKEN_KEY = 'bartertech_jwt_token';

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token);
export const removeToken = (): void => localStorage.removeItem(TOKEN_KEY);

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return {} as T;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      removeToken();
      window.dispatchEvent(new Event('auth-logout'));
    }
    const message = data.mensagem || data.erro || 'Ocorreu um erro na requisição.';
    throw new Error(message);
  }

  return data as T;
}

// API Endpoints
export const api = {
  auth: {
    register: (payload: { nome: string; email: string; senha: string; bio?: string; localizacao?: string; interesses?: string[] }) =>
      request<{ token: string; usuario: Usuario }>('/api/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    login: (payload: { email: string; senha: string }) =>
      request<{ token: string; usuario: Usuario }>('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    me: () => request<Usuario>('/api/v1/auth/me'),
  },

  usuarios: {
    atualizarPerfil: (payload: { nome: string; bio?: string; localizacao?: string; avatarUrl?: string; interesses?: string[] }) =>
      request<Usuario>('/api/v1/usuarios/perfil', {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
    obterPorId: (id: string) => request<Usuario>(`/api/v1/usuarios/${id}`),
    listarComunidade: () => request<Usuario[]>('/api/v1/usuarios/comunidade'),
  },

  servicos: {
    pesquisar: (params: { busca?: string; categoria?: string; pagina?: number; tamanho?: number }) => {
      const q = new URLSearchParams();
      if (params.busca) q.append('busca', params.busca);
      if (params.categoria) q.append('categoria', params.categoria);
      if (params.pagina !== undefined) q.append('pagina', params.pagina.toString());
      if (params.tamanho !== undefined) q.append('tamanho', params.tamanho.toString());
      return request<PageResponse<Servico>>(`/api/v1/servicos?${q.toString()}`);
    },
    listarMeus: () => request<Servico[]>('/api/v1/servicos/meus'),
    obterPorId: (id: string) => request<Servico>(`/api/v1/servicos/${id}`),
    criar: (payload: { titulo: string; tipo: string; categoria: string; descricao: string }) =>
      request<Servico>('/api/v1/servicos', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    atualizar: (id: string, payload: { titulo: string; tipo: string; categoria: string; descricao: string; status: StatusServico }) =>
      request<Servico>(`/api/v1/servicos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
    alternarStatus: (id: string) =>
      request<void>(`/api/v1/servicos/${id}/alternar-status`, {
        method: 'PATCH',
      }),
    excluir: (id: string) =>
      request<void>(`/api/v1/servicos/${id}`, {
        method: 'DELETE',
      }),
    listarCategorias: () => request<string[]>('/api/v1/servicos/categorias'),
  },

  matches: {
    obterMeus: () => request<MatchExplicado[]>('/api/v1/matches'),
  },

  propostas: {
    criar: (payload: {
      destinatarioId: string;
      servicoOferecidoId: string;
      servicoSolicitadoId: string;
      expiraEm: string;
      mensagem?: string;
      condicoes?: { descricao: string; obrigatoria: boolean }[];
    }) =>
      request<Proposta>('/api/v1/propostas', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    listarEnviadas: () => request<Proposta[]>('/api/v1/propostas/enviadas'),
    listarRecebidas: () => request<Proposta[]>('/api/v1/propostas/recebidas'),
    obterPorId: (id: string) => request<Proposta>(`/api/v1/propostas/${id}`),
    aceitar: (id: string) =>
      request<Proposta>(`/api/v1/propostas/${id}/aceitar`, {
        method: 'POST',
      }),
    rejeitar: (id: string) =>
      request<Proposta>(`/api/v1/propostas/${id}/rejeitar`, {
        method: 'POST',
      }),
    cancelar: (id: string) =>
      request<Proposta>(`/api/v1/propostas/${id}/cancelar`, {
        method: 'POST',
      }),
    alternarCondicao: (propostaId: string, condicaoId: string) =>
      request<Proposta>(`/api/v1/propostas/${propostaId}/condicoes/${condicaoId}/alternar`, {
        method: 'PATCH',
      }),
  },

  contratos: {
    gerar: (propostaId: string) =>
      request<Contrato>(`/api/v1/contratos/gerar/${propostaId}`, {
        method: 'POST',
      }),
    listarMeus: () => request<Contrato[]>('/api/v1/contratos'),
    obterPorId: (id: string) => request<Contrato>(`/api/v1/contratos/${id}`),
    obterPorPropostaId: (propostaId: string) => request<Contrato>(`/api/v1/contratos/proposta/${propostaId}`),
    verificarIntegridade: (id: string) =>
      request<VerificacaoIntegridade>(`/api/v1/contratos/${id}/verificar-integridade`),
  },
};
