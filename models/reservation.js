"use strict";

/** Reservation for Lunchly */

const moment = require("moment");

const db = require("../db");

/** A reservation for a party */

class Reservation {
  constructor({ id, customerId, startAt, numGuests, notes }) {
    this.id = id;
    this._customerId = customerId;
    this._startAt = startAt;
    this._numGuests = numGuests;
    this._notes = notes;
  }

  /** formatter for startAt */

  getFormattedStartAt() {
    return moment(this.startAt).format("MMMM Do YYYY, h:mm a");
  }

  /** given a customer id, find their reservations. */

  static async getReservationsForCustomer(customerId) {
    const results = await db.query(
      `SELECT id,
                  customer_id AS "customerId",
                  num_guests AS "numGuests",
                  start_at AS "startAt",
                  notes AS "notes"
           FROM reservations
           WHERE customer_id = $1`,
      [customerId],
    );

    return results.rows.map(row => new Reservation(row));
  }

  /** save this reservation. This will either update or create new reservation */

  async save() {
    if (this.id === undefined) {
      const result = await db.query(
        `INSERT INTO reservations (customer_id, start_at, num_guests, notes)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
        [this.customerId, this.startAt, this.numGuests, this.notes],
      );
      this.id = result.rows[0].id;
    } else {
      await db.query(
        `UPDATE reservations
            SET customer_id=$1,
                start_at=$2,
                numGuests=$3,
                notes=$4
            WHERE id = $5`, [
        this.customerId,
        this.startAt,
        this.numGuests,
        this.notes,
        this.id,
      ],
      );
    }
  }

  /***** Misc Getters / Setters  ******/

  /**get notes */
  get notes() {
    return this._notes;
  }

  /**set notes */
  set notes(newNotes) {
    this._notes = newNotes ? newNotes : '';
  }

  /**get numGuests */
  get numGuests() {
    return this._notes;
  }

  /**set numGuests to number
   * if number less than 1, throw an error without setting
   */
  set numGuests(number) {
    if (number < 1) {
      throw new Error("Must have at least 1 guest");
    } else {
      this._numGuests = number;
    }
  }

  /**get startAt */
  get startAt() {
    return this._startAt;
  }

  /**set startAt */
  set startAt(date) {
    if (!(date instanceof Date)) {
      throw new Error("Must set to instance of date");
    } else {
      this._startAt = date;
    }
  }

  /**get customer_id */
  get customerId() {
    return this._customerId;
  }

  /**set notes */
  set customerId(id) {
    if (this._customerId) {
      throw new Error("Cannot set reservation to different customer");
    } else {
      this._customerId = id;
    }
  }
}


module.exports = Reservation;
