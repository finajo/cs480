<?php
namespace SP\App\Api\CRUD;

require_once __DIR__.'/../arrayManipulation.php';
require_once __DIR__.'/../database/Database.php';

use SP\App\Api\Database\Database;
use SP\App\Api as Api;

abstract class CRUD
{
    protected $db;
    protected $table;

    /**
    * @param Database   $aDB        Database to be injected, if it exists.
    */
    public function __construct($aDB = null)
    {
        $this->db = $aDB ? $aDB : new Database();
    }

    /**
    * @param mixed[]    $bindings   Column names and values of the entry.
    * @return int|false             Number of rows added or false on failure.
    */
    public function create($bindings = array())
    {
        $lists = Api\toQueryLists($bindings);

        return $this->db->query(
            "INSERT INTO $this->table ({$lists['columns']})
            VALUES ({$lists['bindings']})",
            Api\addPrefixToKeys($bindings)
        );
    }

    /**
    * @param  int       $id     ID of row to be deleted.
    * @return int|false Number of rows deleted or false on failure.
    */
    public function delete($id)
    {
        return $this->db->query(
            "DELETE FROM $this->table WHERE id = :id",
            array(':id'=>$id),
            $singleRow
        );
    }

    /**
    * Delete rows not bounded by an id.
    *
    * @param  string    $where  Where clause, such as 'completed = true'.
    * @param  mixed[]   $bindings   Bindings to sanitize clauses. Should NOT have
    *                               a ':' prefix.
    *
    * @return int|false         Number of rows deleted or false on failure.
    */
    public function deleteAll($where, $bindings = array())
    {
        return $this->db->query(
            "DELETE FROM $this->table WHERE $where",
            Api\addPrefixToKeys($bindings)
        );
    }

    /**
    * @param  int      $id          ID of row to grab or
    * @param  mixed[]  $columns     Column names.
    * @param  bool     $singleRow   Get a single row.
    *
    * @return mixed[]|false         Row matching primary key or false on failure.
    */
    public function get($id, $columns = array(), $singleRow = false)
    {
        $colNameList = empty($columns) ? '*' : implode(', ', $columns);

        return $this->db->query(
            "SELECT $colNameList
            FROM $this->table
            WHERE id = :id",
            array(':id'=>$id),
            $singleRow
        );
    }

    /**
    * Select rows not bounded by an id.
    *
    * @param  mixed[]   $columns    Column names.
    * @param  mixed[]   $bindings   Bindings to sanitize clauses. Should NOT have
    *                               a ':' prefix.
    * @param  bool      $singleRow  Get a single row.
    * @param  string    $where      Where clause, such as 'completed = true'.
    * @param  string    $order      Order By clause, such as 'completed'.
    *                               Refers to columns.
    * @param  bool      $asc        Order by ascending or descending order.
    *
    * @return mixed[]|false         Row(s) matching query or false on failure.
    */
    public function getAll(
        $columns = array(),
        $bindings = array(),
        $singleRow = false,
        $where = '',
        $order = '',
        $asc = ''
    ) {
        $colNameList = empty($columns) ? '*' : implode(', ', $columns);
        $where = empty($where) ? '' : 'WHERE ' . $where;

        if (!empty($order)) {
            $order = 'ORDER BY ' . $order;
            $asc = ($asc === true) ? 'ASC' : ($asc === false) ? 'DESC' : '';
        }

        return $this->db->query(
            "SELECT $colNameList FROM $this->table $where $order $asc",
            Api\addPrefixToKeys($bindings),
            $singleRow
        );
    }

    /**
    * @param    int           $id            ID of row to be updated.
    * @param    mixed[]       $bindings      Bindings to be updated.
    *
    * @return   int|false                    Number of rows updated or false on failure.
    */
    public function update($id, $bindings = array())
    {
        $bindingSetList = Api\toBindingSetList($bindings);
        $bindings['id'] = $id;

        return $this->db->query(
            "UPDATE $this->table
            SET $bindingSetList
            WHERE id = :id",
            Api\addPrefixToKeys($bindings)
        );
    }
}
