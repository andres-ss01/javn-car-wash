import { isoDate } from '../../utils/format.js';
import citas from '../admin/citas.js';
import { ordersPage } from '../admin/ordenes.js';
export default function (root) {
  root.innerHTML = '<div id="o"></div><div id="c" style="margin-top:40px"></div>';
  ordersPage(root.querySelector('#o'), { canAssign: false });
  citas(root.querySelector('#c')); // el trabajador confirma y recibe vehículos desde las citas
}
