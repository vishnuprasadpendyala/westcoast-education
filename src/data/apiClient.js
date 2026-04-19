import { API_BASE_URL } from '../config/env.js';

// Generisk API-klient för att hantera CRUD-operationer mot json-server
export default class ApiClient {
  // Privat variabel för resursnamnet (t.ex. 'courses', 'teachers')
  #resource;

  // Konstruktor 
  constructor(resource) {
    this.#resource = resource;
  }

  // Hämta alla resurser, med valfria query-parametrar
  async listAll(params = '') {
    const url = `${API_BASE_URL}/${this.#resource}${params ? '?' + params : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Kunde inte hämta ${this.#resource}`);
    return res.json();
  }

  // Hämta en specifik resurs med hjälp av ID
  async getById(id) {
    const res = await fetch(`${API_BASE_URL}/${this.#resource}/${id}`);
    if (!res.ok) throw new Error(`Hittade inte ${this.#resource} med id ${id}`);
    return res.json();
  }

  // Skapa en ny resurs med POST-anrop
  async create(data) {
    const res = await fetch(`${API_BASE_URL}/${this.#resource}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Kunde inte skapa ${this.#resource}`);
    return res.json();
  }

  // Uppdatera en befintlig resurs med PUT-anrop
  async update(id, data) {
    const res = await fetch(`${API_BASE_URL}/${this.#resource}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Kunde inte uppdatera ${this.#resource}`);
    return res.json();
  }

  // Ta bort en resurs med DELETE-anrop
  async remove(id) {
    const res = await fetch(`${API_BASE_URL}/${this.#resource}/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`Kunde inte ta bort ${this.#resource}`);
    return true;
  }

  // Filtrera resurser med en query-sträng (t.ex. 'area=web3')
  async filter(query) {
    return this.listAll(query);
  }
}