package br.com.bartertech.exception;

public final class PropostaExpiradaException extends TrocaInvalidaException {
    private static final long serialVersionUID = 1L;
    public PropostaExpiradaException(String message) { super(message); }
}
