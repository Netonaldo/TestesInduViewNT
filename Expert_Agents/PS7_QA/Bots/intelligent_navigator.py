import time
import json
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

def intelligent_navigator():
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--window-size=1920,1080")
    
    URL = "https://industryview.doublex.ai/dashboard"
    LOGIN = "virginio.neto@doublex.com.br"
    PASS = "A11223300a@"
    PROJECT_NAME = "Montagem Processo Milho - EBER ATK_102_25"

    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
    wait = WebDriverWait(driver, 30)

    try:
        driver.get(URL)
        print("Efetuando login...")
        wait.until(EC.presence_of_element_located((By.XPATH, "//input[@type='email']"))).send_keys(LOGIN)
        driver.find_element(By.XPATH, "//input[@type='password']").send_keys(PASS)
        driver.find_element(By.XPATH, "//button[@type='submit']").click()
        
        time.sleep(10)
        print("Dashboard carregado. Procurando seletor de projetos...")

        # 1. Tenta encontrar e clicar no seletor de projetos
        # Estratégia: Procura por elementos que contenham "Selecione" ou "Todos os projetos"
        selectors = [
            "//button[contains(., 'projeto')]",
            "//div[contains(text(), 'Selecione')]",
            "//span[contains(text(), 'Todos os projetos')]",
            "//button[contains(@class, 'dropdown')]"
        ]
        
        dropdown_clicked = False
        for xpath in selectors:
            try:
                btn = driver.find_element(By.XPATH, xpath)
                btn.click()
                print(f"Dropdown aberto via: {xpath}")
                dropdown_clicked = True
                break
            except:
                continue
        
        if not dropdown_clicked:
            print("Não foi possível abrir o dropdown automaticamente. Tentando capturar opções visíveis...")

        time.sleep(3)
        
        # 2. Procura o projeto na lista e clica
        try:
            project_option = wait.until(EC.element_to_be_clickable((By.XPATH, f"//*[contains(text(), 'ATK_102_25') or contains(text(), 'Milho')]")))
            project_option.click()
            print(f"Projeto '{PROJECT_NAME}' selecionado!")
            time.sleep(5)
        except:
            print("Projeto não encontrado na lista suspensa.")

        # 3. Mapear seções agora que o projeto está ativo
        sections_to_map = ["Planejamento", "Funcionários", "Estoque", "SSMA"]
        mapping_results = {}

        for section in sections_to_map:
            try:
                link = driver.find_element(By.XPATH, f"//a[contains(text(), '{section}')]")
                link.click()
                time.sleep(5)
                
                # Captura headers de tabelas ou labels de formulários
                fields = [el.text.strip() for el in driver.find_elements(By.XPATH, "//th | //label | //span[contains(@class, 'label')]") if el.text]
                mapping_results[section] = {
                    "url": driver.current_url,
                    "fields": list(set(fields))
                }
                print(f"Seção '{section}' mapeada.")
                driver.save_screenshot(f"Gestao_IA/view_{section}.png")
            except:
                print(f"Não foi possível acessar a seção '{section}'.")

        with open("Gestao_IA/full_project_mapping.json", "w", encoding="utf-8") as f:
            json.dump(mapping_results, f, indent=4, ensure_ascii=False)

        print("Mapeamento completo salvo em Gestao_IA/full_project_mapping.json")

    except Exception as e:
        print(f"Erro na navegação inteligente: {e}")
        driver.save_screenshot("Gestao_IA/error_nav.png")
    finally:
        driver.quit()

if __name__ == "__main__":
    intelligent_navigator()
