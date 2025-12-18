import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./adminMenu.css";

const breakfastItems = [
  {
    name: "Classic Pancakes",
    desc: "Three fluffy buttermilk pancakes served with maple syrup and butter.",
    price: "$12.50",
    img: "https://images.unsplash.com/photo-1587731342248-7fda7c4a7f8d",
  },
  {
    name: "Avocado Toast",
    desc: "Sourdough toast topped with fresh avocado, cherry tomatoes, and chili flakes.",
    price: "$14.00",
    img: "https://images.unsplash.com/photo-1551183053-bf91a1d81141",
  },
  {
    name: "Full English Breakfast",
    desc: "Eggs, bacon, sausage, baked beans, grilled tomato, and toast.",
    price: "$18.00",
    img: "https://images.unsplash.com/photo-1604908554164-f6b30f63a01d",
  },
  {
    name: "Berry Smoothie Bowl",
    desc: "A vibrant blend of berries, banana, and yogurt topped with fresh fruit.",
    price: "$11.00",
    img: "https://images.unsplash.com/photo-1505253216365-8f7b3b5cfc43",
  },
];

const lunchItems = [
  {
    name: "Quinoa & Veggie Salad",
    desc: "A refreshing mix of quinoa, cucumber, tomatoes, and lemon vinaigrette.",
    price: "$15.50",
    img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1",
  },
  {
    name: "Margherita Pizza",
    desc: "Classic pizza with San Marzano tomatoes, mozzarella, and basil.",
    price: "$17.00",
    img: "https://images.unsplash.com/photo-1601924582975-7c4c8b1a2f6b",
  },
  {
    name: "Grilled Chicken Sandwich",
    desc: "Grilled chicken breast with lettuce, tomato, and aioli.",
    price: "$16.00",
    img: "https://images.unsplash.com/photo-1550547660-d9450f859349",
  },
];

export default function AdminMenuPage() {
  return (
    <div className="menu-page">
      <div className="container-fluid">
        <div className="row">
          {/* Sidebar */}
          <aside className="col-md-2 menu-sidebar">
            <ul className="nav flex-column gap-2">
              <li className="nav-item">Drinks</li>
              <li className="nav-item active">Breakfast</li>
              <li className="nav-item">Lunch</li>
              <li className="nav-item">Dinner</li>
              <li className="nav-item">Desserts</li>
            </ul>
          </aside>

          {/* Content */}
          <main className="col-md-10 px-4 py-4">
            {/* Breakfast */}
            <section className="mb-5">
              <h2 className="section-title">Breakfast Menu</h2>
              <p className="section-subtitle">
                Freshly prepared to start your day right.
              </p>

              <div className="row g-4">
                {breakfastItems.map((item, i) => (
                  <div key={i} className="col-lg-3 col-md-4 col-sm-6">
                    <div className="menu-card card-alt">
                      <img src={item.img} alt={item.name} />
                      <div className="menu-card-body">
                        <h5>{item.name}</h5>
                        <p>{item.desc}</p>
                        <span>{item.price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Lunch */}
            <section>
              <h2 className="section-title">Lunch Menu</h2>
              <p className="section-subtitle">
                Delicious and satisfying midday meals.
              </p>

              <div className="row g-4">
                {lunchItems.map((item, i) => (
                  <div key={i} className="col-lg-3 col-md-4 col-sm-6">
                    <div className="menu-card card-alt">
                      <img src={item.img} alt={item.name} />
                      <div className="menu-card-body">
                        <h5>{item.name}</h5>
                        <p>{item.desc}</p>
                        <span>{item.price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
