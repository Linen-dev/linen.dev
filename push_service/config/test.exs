import Config

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :push_service, PushServiceWeb.Endpoint,
  http: [ip: {127, 0, 0, 1}, port: 4002],
  secret_key_base: "l70VQ33buQ0yFajB9wGgGrqvNsDblzb9bLS8iVyRm0tpqH3HvWeE41+I69G2psnt",
  server: false

# In test we don't send emails.
config :push_service, PushService.Mailer,
  adapter: Swoosh.Adapters.Test

# Print only warnings and errors during test
config :logger, level: :warn

# Initialize plugs at runtime for faster test compilation
config :phoenix, :plug_init_mode, :runtime
