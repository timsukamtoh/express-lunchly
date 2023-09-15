SELECT id,
        first_name AS "firstName",
        last_name  AS "lastName",
        phone,
        notes
    FROM customers
    WHERE LOWER(CONCAT(first_name,' ',last_name)) LIKE '%richard%'
    ORDER BY last_name, first_name;




SELECT id, first_name, last_name,
 phone, notes, count(reservations.id)
    FROM customers
    JOIN reservations
        ON reservations.customer_id = customer.id
    GROUP BY customer.id
    ORDER BY count(reservations.id) DESC
    LIMIT 10;