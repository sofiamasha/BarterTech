-- Schema inicial do BarterTech

CREATE TABLE usuarios (
    id UUID PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(200) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    bio VARCHAR(1000),
    localizacao VARCHAR(150),
    avatar_url VARCHAR(500),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE usuario_interesses (
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo_servico VARCHAR(100) NOT NULL,
    PRIMARY KEY (usuario_id, tipo_servico)
);

CREATE TABLE servicos (
    id UUID PRIMARY KEY,
    proprietario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo VARCHAR(150) NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    descricao VARCHAR(2000) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'DISPONIVEL',
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE propostas (
    id UUID PRIMARY KEY,
    solicitante_id UUID NOT NULL REFERENCES usuarios(id),
    destinatario_id UUID NOT NULL REFERENCES usuarios(id),
    servico_oferecido_id UUID NOT NULL REFERENCES servicos(id),
    servico_solicitado_id UUID NOT NULL REFERENCES servicos(id),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDENTE',
    mensagem VARCHAR(2000),
    criada_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expira_em TIMESTAMP NOT NULL
);

CREATE TABLE proposta_condicoes (
    id UUID PRIMARY KEY,
    proposta_id UUID NOT NULL REFERENCES propostas(id) ON DELETE CASCADE,
    descricao VARCHAR(1000) NOT NULL,
    obrigatoria BOOLEAN NOT NULL DEFAULT FALSE,
    atendida BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE proposta_historico (
    id UUID PRIMARY KEY,
    proposta_id UUID NOT NULL REFERENCES propostas(id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL,
    observacao VARCHAR(1000),
    ocorrido_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE contratos (
    id UUID PRIMARY KEY,
    proposta_id UUID NOT NULL UNIQUE REFERENCES propostas(id),
    gerado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    conteudo TEXT NOT NULL,
    hash_integridade VARCHAR(64) NOT NULL
);

-- Índices estratégicos para performance e algoritmo de match
CREATE INDEX idx_servicos_proprietario ON servicos(proprietario_id);
CREATE INDEX idx_servicos_tipo_status ON servicos(tipo, status);
CREATE INDEX idx_servicos_categoria ON servicos(categoria);
CREATE INDEX idx_interesses_tipo ON usuario_interesses(tipo_servico);
CREATE INDEX idx_propostas_solicitante ON propostas(solicitante_id);
CREATE INDEX idx_propostas_destinatario ON propostas(destinatario_id);
CREATE INDEX idx_propostas_status ON propostas(status);
