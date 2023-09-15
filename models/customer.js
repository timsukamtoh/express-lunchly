"use strict";

/** Customer for Lunchly */

const db = require("../db");
const Reservation = require("./reservation");

/** Customer of the restaurant. */

class Customer {
  constructor({ id, firstName, lastName, phone, notes }) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.phone = phone;
    this.notes = notes;
  }

  /** return full name of customer */
  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  /**
   * Find customers - can be all or based on name search
   * @param {String?} search the search term
   * @returns an array of Customer instances
   */
  static async all(search = '') {
    search = search.toLowerCase();

    const results = await db.query(
      `SELECT id,
                  first_name AS "firstName",
                  last_name  AS "lastName",
                  phone,
                  notes
           FROM customers
           WHERE LOWER(CONCAT(first_name,' ',last_name)) LIKE $1
           ORDER BY last_name, first_name`,
      [`%${search}%`]
    );
    return results.rows.map(c => new Customer(c));
  }

  /**
   * Performs query and returns array of Customers ordered by reservation count desc
   * @param {Int?} limit the number of results to limit to
   * @returns an array of Customer instances
   */
  static async getBestCustomers(limit = 10) {
    const results = await db.query(
      `SELECT customers.id,
              customers.first_name AS "firstName",
              customers.last_name  AS "lastName",
              customers.phone,
              customers.notes
            FROM customers
            JOIN reservations
            ON reservations.customer_id = customers.id
            GROUP BY customers.id
            ORDER BY count(reservations.id) DESC
            LIMIT $1`,
      [limit]
    );
    return results.rows.map(c => new Customer(c));
  }

  /** get a customer by ID. */

  static async get(id) {
    const results = await db.query(
      `SELECT id,
                  first_name AS "firstName",
                  last_name  AS "lastName",
                  phone,
                  notes
           FROM customers
           WHERE id = $1`,
      [id],
    );

    const customer = results.rows[0];

    if (customer === undefined) {
      const err = new Error(`No such customer: ${id}`);
      err.status = 404;
      throw err;
    }

    return new Customer(customer);
  }

  /** get all reservations for this customer. */

  async getReservations() {
    return await Reservation.getReservationsForCustomer(this.id);
  }

  /** save this customer. */

  async save() {
    if (this.id === undefined) {
      const result = await db.query(
        `INSERT INTO customers (first_name, last_name, phone, notes)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
        [this.firstName, this.lastName, this.phone, this.notes],
      );
      this.id = result.rows[0].id;
    } else {
      await db.query(
        `UPDATE customers
             SET first_name=$1,
                 last_name=$2,
                 phone=$3,
                 notes=$4
             WHERE id = $5`, [
        this.firstName,
        this.lastName,
        this.phone,
        this.notes,
        this.id,
      ],
      );
    }
  }

  /***** Misc Getters / Setters  ******/

  get notes() {
    return this._notes;
  }

  set notes(newNotes) {
    this._notes = newNotes? newNotes : '';
  }
}

module.exports = Customer;
