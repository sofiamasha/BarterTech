package br.com.bartertech.exception;

public class TrocaInvalidaException extends RuntimeException {
    private static final long serialVersionUID = 1L;
    public TrocaInvalidaException(String message) { super(message); }
}
