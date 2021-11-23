import bcrypt

salt = bcrypt.gensalt().decode('utf-8')
print(f"export CARTO_SALT='{salt}'")
