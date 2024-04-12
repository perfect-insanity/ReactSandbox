import { ReactComponent as EmptyStar } from '../assets/star-empty.svg'
import { ReactComponent as FilledStar } from '../assets/star-filled.svg'

const EventCard = ({ id, location, duration, header, complexity }) => {
    const stars = [];
    for (let i = 1; i <= 5; i++)
      stars.push(i <= complexity ? <FilledStar /> : <EmptyStar />);
  
    return (
      <div id={id} className="event-card">
        <button className="card-location small-text">{location}</button>
  
        <div className="card-content">
          <div className="small-text card-calendar">{duration}</div>
          <h3 className="card-header">{header}</h3>
          <div className="small-text card-mode">
            <div className="card-mode-caption">Сложность:</div>
            {stars}
          </div>
        </div>
      </div>
    )
  }
  
  export const MainPage = () => (
    <main>
      <section className="promo-section">
        <div className="promo">
          <h1 className="promo-header">Исследуйте вкусы Кавказа</h1>
          <p className="big-text promo-desc">В сопровождении опытных шеф-поваров вы откроете для себя богатство кавказской кухни и научитесь готовить традиционные блюда.</p>
          <button className="big-text promo-button">Подробнее о курсе</button>
        </div>
      </section>
      <section className="cards-section vertical-layout">
        <h2 className="cards-main-header">Предстоящие события</h2>
        <div className="cards-container horizontal-layout">
          <EventCard
            id="card-1"
            location="Кавказ"
            duration="4 дня"
            header="Гастрономическое путешествие вокруг Кавказа"
            complexity="3"
          />
          <EventCard
            id="card-2"
            location="Алтай"
            duration="13 дней"
            header="Путь к мастерству в приготовлении блюд Алтая"
            complexity="2"
          />
          <EventCard
            id="card-3"
            location="Адыгея"
            duration="6 дней"
            header="От горных трав до морских деликатесов"
            complexity="4"
          />
        </div>
        <div className="show-all"><a href="#example" className="link-2">Показать все курсы</a></div>
      </section>
    </main>
  )