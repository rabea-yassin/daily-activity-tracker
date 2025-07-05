## **README: Daily Activity Tracker**

### **Project Overview**

The **Daily Activity Tracker** is a simple yet powerful tool that helps you monitor how much time you spend on four core activities every day:

- **Studying**
- **Productive Time** (work, tasks, focused effort)
- **Resting** (breaks, leisure, downtime)
- **Sleeping**

The app tracks your time **live**, offers a **visual summary with a pie chart**, and lets you add manual time slots. The goal is to give you insights into your daily routines so you can **improve productivity and achieve a better work-rest balance**.

---

## **Features**

1. **Four Activity Modes**

   - **Studying**
   - **Productive Time**
   - **Resting**
   - **Sleeping**  
     Switch between modes with buttons to track time accurately. The system starts in **Rest Mode** by default.

2. **Live Time Tracking**

   - The timers update **live every second**.
   - You can always see the **current mode and its duration**.

3. **Sleep Schedule Management**

   - Set a **custom sleep schedule** by specifying the start and end times.
   - The **sleep time is automatically tracked** from the set times.
   - Time beyond the sleep end is **reallocated to Rest Mode**.

4. **Manual Activity Slot Input**

   - Add a study or productive session with **custom start and end times**.
   - The app ensures that the slot **does not overlap with sleep** and **does not exceed the current time**.
   - Time from **Rest Mode is subtracted** to accommodate the session.

5. **Clear Data**

   - Reset all timers with the **Clear Data button**.
   - **Sleep schedules remain intact**, so you won’t need to re-enter them.

6. **Visual Summary with Pie Chart**

   - Get a **visual breakdown** of your time with a live-updating pie chart.
   - **Hover over the chart** to see the exact time spent in each mode.

7. **Dark Mode**

   - Toggle between light and dark themes for comfortable viewing day or night.

8. **Mobile Responsive & Accessible UI**
   - The interface adapts to phone screens and is keyboard/screen-reader friendly.
   - Buttons, forms, and charts are touch-friendly and visually separated for clarity.

---

## **How It Works**

1. **Switching Modes**

   - Click one of the **mode buttons** to start tracking time for that mode.
   - The previous mode’s time is **logged automatically**.

2. **Setting Sleep Schedule**

   - Use the **Sleep Start** and **Sleep End** fields to set your sleep schedule.
   - When the schedule is saved, the **sleep time is calculated**, and any extra time is assigned to **Rest Mode**.

3. **Adding a Manual Activity Slot**
   - Enter the **start and end times** for a study or productive session.
   - Ensure the session does **not overlap with sleep** or **exceed the current time**.
   - Resting time will be **reduced**, and the relevant timer will be updated.

---

## **Setup Instructions**

1. **Clone the Repository or Download the Files**

   - Ensure you have the following files in your project directory:
     - `index.html`
     - `styles.css`
     - `script.js`

2. **Open the Application**

   - Open `index.html` in a web browser.

3. **Usage**
   - Start tracking your activities by clicking the mode buttons.
   - Set your sleep schedule and add manual activity slots as needed.

---

## **Technologies Used**

- **HTML**: Provides the structure for the web page.
- **CSS**: Styles the layout for a clean, modern, and responsive interface.
- **JavaScript**: Manages timers, validations, mode switching, and chart updates.
- **Chart.js**: Displays the time distribution with a pie chart.

---

## **How to Customize**

- **Modify Colors**: Edit the `styles.css` file to change the colors of buttons and charts.
- **Add Notifications**: Implement `alert()` or `setTimeout()` functions to notify when you switch modes too often.
- **Track More Activities**: Extend the app by adding new modes (e.g., Exercise, Work).

---

## **Known Issues and Future Improvements**

- **Continuous Tracking for Multiple Days**: This version tracks only a **single day**. A future version could include **multiple-day summaries**.
- **Notifications/Reminders**: Add reminders for long rest or inactivity periods.

---

## **Author and License**

Created by **Rabea Yassin**.  
Feel free to use, modify, and distribute this project for personal or educational purposes.
