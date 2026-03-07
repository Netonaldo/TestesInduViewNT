import time
import json
import os
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

def run_human_mimic():
    chrome_options = Options()
    chrome_options.add_argument("--headless") 
    chrome_options.add_argument("--window-size=1920,1080")
    
    URL = "https://industryview.doublex.ai/dashboard"
    LOGIN = "virginio.neto@doublex.com.br"
    PASS = "A11223300a@"
    PROJECT_NAME = "Montagem Processo Milho - EBER ATK_102_25"

    print("[PM] Iniciando Robô de Experiência do Usuário...")
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
    wait = WebDriverWait(driver, 35)

    try:
        # 1. ACESSO
        driver.get(URL)
        print("[PM] Página de login acessada.")
        wait.until(EC.presence_of_element_located((By.XPATH, "//input[@type='email']"))).send_keys(LOGIN)
        driver.find_element(By.XPATH, "//input[@type='password']").send_keys(PASS)
        driver.find_element(By.XPATH, "//button[@type='submit']").click()
        
        # 2. SELEÇÃO DE PROJETO
        time.sleep(12)
        print("[PM] Dashboard carregado. Selecionando projeto...")
        
        try:
            # Clica no seletor de projeto
            project_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'projeto')] | //div[contains(text(), 'projeto')] | //div[contains(@class, 'select')]")))
            project_btn.click()
            time.sleep(3)
            
            # Seleciona o ATK_102_25
            option = wait.until(EC.element_to_be_clickable((By.XPATH, f"//*[contains(text(), 'ATK_102_25') or contains(text(), 'Milho')]")))
            option.click()
            print(f"[PM] Projeto '{PROJECT_NAME}' selecionado.")
            time.sleep(8)
            driver.save_screenshot("Gestao_IA/01_projeto_selecionado.png")
        except Exception as e:
            print(f"[Aviso] Erro na seleção automática: {e}")

        # 3. NAVEGAÇÃO INTERNA (Simulando clique humano no menu lateral)
        sections = ["Planejamento", "Funcionários", "Estoque", "SSMA"]
        for section in sections:
            print(f"[PM] Tentando acessar '{section}'...")
            try:
                # Procura o link no menu lateral
                link = wait.until(EC.element_to_be_clickable((By.XPATH, f"//a[contains(., '{section}')] | //span[contains(., '{section}')]/..")))
                link.click()
                time.sleep(8)
                driver.save_screenshot(f"Gestao_IA/02_view_{section}.png")
                print(f"[PM] Seção '{section}' acessada com sucesso.")
                
                # Reporta o título H1 ou H2 da página para confirmar o local
                try:
                    title = driver.find_element(By.TAG_NAME, "h1").text
                    print(f"[{section}] Título da página: {title}")
                except:
                    pass
            except Exception as e:
                print(f"[PM] Falha ao acessar '{section}': Menu pode estar em ícone ou SPA não respondeu.")

        print("[PM] Manipulação concluída.")

    except Exception as e:
        print(f"[Crítico] Erro durante a manipulação: {e}")
        driver.save_screenshot("Gestao_IA/erro_fatal.png")
    finally:
        driver.quit()

if __name__ == "__main__":
    run_human_mimic()
