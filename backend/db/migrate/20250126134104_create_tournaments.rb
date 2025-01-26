class CreateTournaments < ActiveRecord::Migration[8.0]
  def change
    create_table :tournaments do |t|
      t.string :name
      t.datetime :date
      t.decimal :entry_fee

      t.timestamps
    end
  end
end
